import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { promisify } from 'util'; // Added for sshExec

export const dynamic = 'force-dynamic';

// Helper to execute SSH commands safely
async function sshExec(command: string) {
    const { exec } = require('child_process');
    const execAsync = promisify(exec);

    // Using verified credentials
    const sshPass = 'y0JEu4uI0hAQ606Mfr';
    const serverIp = '172.245.56.50';
    const sshpassPath = '/opt/homebrew/bin/sshpass';

    try {
        const { stdout, stderr } = await execAsync(`${sshpassPath} -p "${sshPass}" ssh -o StrictHostKeyChecking=no root@${serverIp} "${command}"`);
        return { success: true, stdout, stderr };
    } catch (error: any) {
        return { success: false, error: error.message, stdout: error.stdout, stderr: error.stderr };
    }
}

export async function GET() {
    try {
        // 1. Check n8n API health
        const n8nUrl = 'https://n8n.rensto.com/api/v1/healthz';
        const healthRes = await fetch(n8nUrl, { signal: AbortSignal.timeout(3000) }).catch(() => ({ ok: false }));

        // 2. Fetch Deep Diagnostics via SSH
        const serverData = await sshExec(`
            echo "---STATS---"
            docker stats --no-stream --format "{{.Name}}:{{.CPUPerc}}:{{.MemUsage}}" | grep -E "n8n|browserless|waha"
            
            echo "---DISK---"
            df -h / | tail -1 | awk '{print $5 ":" $4}'
            
            echo "---DB_SIZE---"
            docker exec n8n_postgres psql -U n8n -d n8n -c "SELECT count(*) FROM execution_entity;" | sed -n '3p' | xargs echo
            
            echo "---LOG_ERRORS---"
            docker logs --tail 500 n8n_rensto 2>&1 | grep -iE "error|timeout|oom" | wc -l
            
            echo "---BACKUPS---"
            ls -dt /root/n8n-backups/*/ | head -n 5 | xargs -I {} basename {}
            
            echo "---VERSION---"
            docker exec n8n_rensto n8n --version
        `);

        if (!serverData.success) throw new Error('Deep diagnostics failed');

        const parts = serverData.stdout.split('---');
        const statsRaw = parts.find((p: string) => p.startsWith('STATS'))?.replace('STATS---\n', '') || '';
        const diskRaw = parts.find((p: string) => p.startsWith('DISK'))?.replace('DISK---\n', '').trim() || '0%:0GB';
        const dbRowsRaw = parts.find((p: string) => p.startsWith('DB_SIZE'))?.replace('DB_SIZE---\n', '').trim() || '0';
        const logErrorsRaw = parts.find((p: string) => p.startsWith('LOG_ERRORS'))?.replace('LOG_ERRORS---\n', '').trim() || '0';
        const backupsRaw = parts.find((p: string) => p.startsWith('BACKUPS'))?.replace('BACKUPS---\n', '') || '';
        const versionRaw = parts.find((p: string) => p.startsWith('VERSION'))?.replace('VERSION---\n', '') || 'Unknown';

        const [diskUsage, diskFree] = diskRaw.split(':');

        const services = statsRaw.split('\n').filter(Boolean).map((line: string) => {
            const [name, cpu, mem] = line.split(':');
            return { name, cpu, mem };
        });

        const backups = backupsRaw.split('\n').filter(Boolean);

        return NextResponse.json({
            success: true,
            status: healthRes.ok ? 'online' : 'degraded',
            version: versionRaw.trim(),
            services,
            backups,
            diagnostics: {
                diskUsage,
                diskFree,
                dbExecRows: dbRowsRaw,
                recentLogErrors: logErrorsRaw
            },
            lastChecked: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Deep diagnostic fetch failed'
        });
    }
}

export async function POST(req: NextRequest) {
    const { action, targetVersion } = await req.json();

    // Handling Quick Actions
    if (action === 'restart' || action === 'manual-backup' || action === 'prune' || action === 'rebuild') {
        let cmd = '';
        switch (action) {
            case 'restart': cmd = 'cd /opt/n8n && docker compose restart n8n_rensto'; break;
            case 'manual-backup': cmd = 'bash /opt/n8n/rensto-n8n-upgrade.sh backup-only'; break;
            case 'prune': cmd = 'docker exec n8n_rensto n8n executions:prune --days 7 && docker system prune -f'; break;
            case 'rebuild': cmd = 'cd /opt/n8n && docker compose down && docker compose up -d --build'; break;
        }

        const result = await sshExec(cmd);
        return NextResponse.json({ success: result.success, output: result.stdout || result.error });
    }

    if (action !== 'upgrade') {
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    if (!targetVersion) {
        return NextResponse.json({ success: false, error: 'Target version required' }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start(controller) {
            const sendUpdate = (type: string, data: string) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type, data })}\n\n`));
            };

            sendUpdate('info', `🚀 Starting remote upgrade to v${targetVersion}...`);

            // Use the verified sshpass + ssh command
            // Note: In production, these should be env variables
            const sshPass = 'y0JEu4uI0hAQ606Mfr';
            const serverIp = '172.245.56.50';
            const sshpassPath = '/opt/homebrew/bin/sshpass';

            const child = spawn(sshpassPath, [
                '-p', sshPass,
                'ssh', '-o', 'StrictHostKeyChecking=no',
                `root@${serverIp}`,
                `bash /opt/n8n/rensto-n8n-upgrade.sh ${targetVersion} --non-interactive`
            ]);

            child.stdout.on('data', (data) => {
                const lines = data.toString().split('\n');
                lines.forEach((line: string) => {
                    if (line.trim()) sendUpdate('log', line);
                });
            });

            child.stderr.on('data', (data) => {
                sendUpdate('warning', data.toString());
            });

            child.on('close', (code) => {
                if (code === 0) {
                    sendUpdate('success', '✅ Upgrade process completed successfully.');
                } else {
                    sendUpdate('error', `❌ Upgrade failed with exit code ${code}`);
                }
                controller.close();
            });

            child.on('error', (err) => {
                sendUpdate('error', `❌ Failed to start process: ${err.message}`);
                controller.close();
            });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
