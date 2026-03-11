import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const VPS_IP = '172.245.56.50';

async function probe(url: string, timeoutMs = 5000): Promise<{ ok: boolean; latencyMs: number; body?: string }> {
  const start = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), cache: 'no-store' });
    const latencyMs = Date.now() - start;
    let body: string | undefined;
    try { body = await res.text(); } catch {}
    return { ok: res.ok, latencyMs, body };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

/**
 * GET /api/admin/system-monitoring
 * Fetches real system metrics from RackNerd via the worker health endpoint,
 * plus PM2 and Docker status via dedicated probe endpoints.
 */
export async function GET() {
  const session = await verifySession();
  if (!session.isValid || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Probe the worker health endpoint — it returns system metrics
    const [workerHealth, pm2Probe, dockerProbe] = await Promise.all([
      probe(`http://${VPS_IP}:3002/api/health`),
      probe(`http://${VPS_IP}:3002/api/diagnostics/pm2`).catch(() => ({ ok: false, latencyMs: 0, body: undefined })),
      probe(`http://${VPS_IP}:3002/api/diagnostics/docker`).catch(() => ({ ok: false, latencyMs: 0, body: undefined })),
    ]);

    // Parse worker health response for system metrics
    let systemMetrics = {
      cpu: 0,
      memory: 0,
      memoryUsedGb: '0',
      memoryTotalGb: '0',
      disk: 0,
      diskUsedGb: '0',
      diskTotalGb: '0',
      uptime: 'Unknown',
      loadAvg: [0, 0, 0] as number[],
      hostname: 'racknerd-vps',
      workerStatus: 'offline' as 'online' | 'offline',
      workerLatencyMs: workerHealth.latencyMs,
    };

    if (workerHealth.ok && workerHealth.body) {
      try {
        const healthData = JSON.parse(workerHealth.body);
        // The worker health endpoint typically returns system info
        const sys = healthData.system || healthData;
        systemMetrics = {
          cpu: sys.cpuUsage ?? sys.cpu ?? 0,
          memory: sys.memoryUsage ?? sys.memory ?? 0,
          memoryUsedGb: sys.memoryUsedGb ?? '0',
          memoryTotalGb: sys.memoryTotalGb ?? '0',
          disk: sys.diskUsage ?? sys.disk ?? 0,
          diskUsedGb: sys.diskUsedGb ?? '0',
          diskTotalGb: sys.diskTotalGb ?? '0',
          uptime: sys.uptime ?? formatUptime(sys.uptimeSeconds) ?? 'Unknown',
          loadAvg: sys.loadAvg ?? [0, 0, 0],
          hostname: sys.hostname ?? 'racknerd-vps',
          workerStatus: 'online',
          workerLatencyMs: workerHealth.latencyMs,
        };
      } catch {
        systemMetrics.workerStatus = 'online';
      }
    }

    // Parse PM2 process list
    let pm2Processes: Array<{
      name: string;
      status: string;
      cpu: number;
      memory: string;
      uptime: string;
      restarts: number;
      pid: number;
    }> = [];

    if (pm2Probe.ok && pm2Probe.body) {
      try {
        const pm2Data = JSON.parse(pm2Probe.body);
        pm2Processes = (pm2Data.processes || pm2Data || []).map((p: any) => ({
          name: p.name || 'unknown',
          status: p.status || p.pm2_env?.status || 'unknown',
          cpu: p.cpu || p.monit?.cpu || 0,
          memory: formatBytes(p.memory || p.monit?.memory || 0),
          uptime: p.uptime || formatUptime(p.pm2_env?.pm_uptime ? (Date.now() - p.pm2_env.pm_uptime) / 1000 : 0),
          restarts: p.restarts || p.pm2_env?.restart_time || 0,
          pid: p.pid || 0,
        }));
      } catch {}
    }

    // If PM2 probe failed, try to get basic info from worker health
    if (pm2Processes.length === 0 && workerHealth.ok && workerHealth.body) {
      try {
        const healthData = JSON.parse(workerHealth.body);
        if (healthData.pm2 || healthData.processes) {
          const procs = healthData.pm2 || healthData.processes || [];
          pm2Processes = Array.isArray(procs) ? procs.map((p: any) => ({
            name: p.name || 'unknown',
            status: p.status || 'unknown',
            cpu: p.cpu || 0,
            memory: p.memory || '0 MB',
            uptime: p.uptime || 'unknown',
            restarts: p.restarts || 0,
            pid: p.pid || 0,
          })) : [];
        }
      } catch {}
    }

    // Parse Docker containers
    let dockerContainers: Array<{
      name: string;
      status: string;
      image: string;
      ports: string;
      state: 'running' | 'stopped' | 'error';
    }> = [];

    if (dockerProbe.ok && dockerProbe.body) {
      try {
        const dockerData = JSON.parse(dockerProbe.body);
        dockerContainers = (dockerData.containers || dockerData || []).map((c: any) => ({
          name: c.name || c.Names || 'unknown',
          status: c.status || c.Status || 'unknown',
          image: c.image || c.Image || 'unknown',
          ports: c.ports || c.Ports || '',
          state: (c.state || c.State || '').toLowerCase().includes('running') ? 'running' as const
            : (c.state || c.State || '').toLowerCase().includes('exit') ? 'stopped' as const
            : 'error' as const,
        }));
      } catch {}
    }

    // If no Docker probe endpoint, try to infer from known services
    if (dockerContainers.length === 0) {
      const knownServices = [
        { name: 'postgres_db', port: 5432, image: 'pgvector/pgvector:pg16' },
        { name: 'redis', port: 6379, image: 'redis:alpine' },
        { name: 'waha', port: 3000, image: 'devlikeapro/waha-plus' },
        { name: 'n8n', port: 5678, image: 'n8nio/n8n' },
      ];

      const containerProbes = await Promise.all(
        knownServices.map(async (svc) => {
          const p = await probe(`http://${VPS_IP}:${svc.port}/`, 3000).catch(() => ({ ok: false, latencyMs: 0 }));
          return {
            name: svc.name,
            status: p.ok ? 'Up' : 'Down / Not responding',
            image: svc.image,
            ports: `${svc.port}`,
            state: p.ok ? 'running' as const : 'stopped' as const,
          };
        })
      );
      dockerContainers = containerProbes;
    }

    // Compute alerts
    const alerts: string[] = [];
    if (systemMetrics.cpu > 90) alerts.push('CPU usage critical (>90%)');
    if (systemMetrics.memory > 90) alerts.push('Memory usage critical (>90%)');
    if (systemMetrics.disk > 85) alerts.push('Disk usage high (>85%)');
    if (systemMetrics.workerStatus === 'offline') alerts.push('Worker is offline');
    pm2Processes.forEach(p => {
      if (p.status !== 'online') alerts.push(`PM2 process "${p.name}" is ${p.status}`);
    });
    dockerContainers.forEach(c => {
      if (c.state !== 'running') alerts.push(`Docker "${c.name}" is ${c.state}`);
    });

    return NextResponse.json({
      metrics: systemMetrics,
      pm2: pm2Processes,
      docker: dockerContainers,
      alerts,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[system-monitoring] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch system metrics', detail: error.message }, { status: 500 });
  }
}

function formatUptime(seconds?: number): string {
  if (!seconds || seconds <= 0) return 'Unknown';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  if (mb > 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb.toFixed(0)} MB`;
}
