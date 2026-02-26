// Health Checker — Runs health checks against all registered services
// Stores results in service_health table, detects status changes

import { prisma } from '@/lib/prisma';
import { SERVICE_REGISTRY, type MonitoredService, type ServiceStatus } from './service-registry';

export interface HealthCheckResult {
  serviceId: string;
  name: string;
  category: string;
  status: ServiceStatus['status'];
  latencyMs: number;
  message?: string;
  details?: Record<string, any>;
  checkedAt: Date;
}

/**
 * Run health checks against all registered services (or a filtered subset).
 * Stores results in DB and returns them.
 */
export async function runHealthChecks(
  serviceIds?: string[]
): Promise<HealthCheckResult[]> {
  const services = serviceIds
    ? SERVICE_REGISTRY.filter(s => serviceIds.includes(s.id))
    : SERVICE_REGISTRY;

  const results: HealthCheckResult[] = [];

  // Run all checks concurrently
  const checks = services.map(async (service: MonitoredService) => {
    let status: ServiceStatus;
    try {
      status = await service.healthCheck();
    } catch (err: any) {
      status = { status: 'down', latencyMs: 0, message: `Check threw: ${err.message}` };
    }

    const result: HealthCheckResult = {
      serviceId: service.id,
      name: service.name,
      category: service.category,
      status: status.status,
      latencyMs: status.latencyMs,
      message: status.message,
      details: status.details,
      checkedAt: new Date(),
    };

    results.push(result);

    // Persist to DB
    try {
      await prisma.serviceHealth.create({
        data: {
          serviceId: service.id,
          name: service.name,
          category: service.category,
          status: status.status,
          latencyMs: status.latencyMs,
          message: status.message,
          details: status.details ? (status.details as any) : undefined,
          checkedAt: result.checkedAt,
        },
      });
    } catch (dbErr: any) {
      console.error(`[HEALTH] Failed to persist ${service.id}:`, dbErr.message);
    }

    return result;
  });

  await Promise.allSettled(checks);

  return results;
}

/**
 * Get the latest health status for all services.
 */
export async function getLatestHealthStatus(): Promise<HealthCheckResult[]> {
  // Get the most recent check for each service
  const services = SERVICE_REGISTRY.map(s => s.id);

  const results: HealthCheckResult[] = [];

  for (const serviceId of services) {
    const latest = await prisma.serviceHealth.findFirst({
      where: { serviceId },
      orderBy: { checkedAt: 'desc' },
    });

    if (latest) {
      results.push({
        serviceId: latest.serviceId,
        name: latest.name,
        category: latest.category,
        status: latest.status as ServiceStatus['status'],
        latencyMs: latest.latencyMs || 0,
        message: latest.message || undefined,
        details: latest.details as Record<string, any> | undefined,
        checkedAt: latest.checkedAt,
      });
    } else {
      // No check yet — mark unknown
      const service = SERVICE_REGISTRY.find(s => s.id === serviceId);
      if (service) {
        results.push({
          serviceId: service.id,
          name: service.name,
          category: service.category,
          status: 'unknown',
          latencyMs: 0,
          message: 'Never checked',
          checkedAt: new Date(),
        });
      }
    }
  }

  return results;
}

/**
 * Calculate uptime percentage for a service over a period.
 */
export async function getUptimePercentage(
  serviceId: string,
  hours: number = 24
): Promise<number> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const checks = await prisma.serviceHealth.findMany({
    where: { serviceId, checkedAt: { gte: since } },
    select: { status: true },
  });

  if (checks.length === 0) return 100; // No data = assume healthy

  const healthy = checks.filter(c => c.status === 'healthy' || c.status === 'degraded').length;
  return Math.round((healthy / checks.length) * 10000) / 100;
}

/**
 * Get health history for a service (for charts).
 */
export async function getHealthHistory(
  serviceId: string,
  hours: number = 24,
  limit: number = 100
): Promise<HealthCheckResult[]> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const records = await prisma.serviceHealth.findMany({
    where: { serviceId, checkedAt: { gte: since } },
    orderBy: { checkedAt: 'desc' },
    take: limit,
  });

  return records.map(r => ({
    serviceId: r.serviceId,
    name: r.name,
    category: r.category,
    status: r.status as ServiceStatus['status'],
    latencyMs: r.latencyMs || 0,
    message: r.message || undefined,
    details: r.details as Record<string, any> | undefined,
    checkedAt: r.checkedAt,
  }));
}

/**
 * Clean up old health check records (> 30 days).
 */
export async function cleanupOldRecords(daysToKeep: number = 30): Promise<number> {
  const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  const result = await prisma.serviceHealth.deleteMany({
    where: { checkedAt: { lt: cutoff } },
  });
  return result.count;
}
