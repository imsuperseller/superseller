// Alert Engine — Evaluates health results against rules, fires notifications
// Channels: email (Resend), audit_log (PostgreSQL)

import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { ADMIN_EMAILS } from '@/lib/auth';
import type { HealthCheckResult } from './health-checker';

export interface AlertEvent {
  ruleId?: string;
  serviceId: string;
  severity: 'critical' | 'warning' | 'info';
  condition: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * Evaluate health check results against alert rules and fire alerts.
 */
export async function evaluateAlerts(results: HealthCheckResult[]): Promise<AlertEvent[]> {
  const firedAlerts: AlertEvent[] = [];

  // Get all enabled rules
  const rules = await prisma.alertRule.findMany({ where: { enabled: true } });

  for (const result of results) {
    // Check for service_down rules
    const downRules = rules.filter(
      r => r.serviceId === result.serviceId && r.condition === 'service_down'
    );

    for (const rule of downRules) {
      if (result.status === 'down') {
        // Check consecutive failures
        const recentChecks = await prisma.serviceHealth.findMany({
          where: { serviceId: result.serviceId },
          orderBy: { checkedAt: 'desc' },
          take: Math.ceil(rule.threshold),
        });

        const allDown = recentChecks.every(c => c.status === 'down');
        if (allDown && recentChecks.length >= rule.threshold) {
          const shouldFire = await checkCooldown(rule.id, rule.cooldownMinutes);
          if (shouldFire) {
            const alert: AlertEvent = {
              ruleId: rule.id,
              serviceId: result.serviceId,
              severity: 'critical',
              condition: 'service_down',
              message: `${result.name} is DOWN. ${recentChecks.length} consecutive failures. Last error: ${result.message || 'Unknown'}`,
              details: { latencyMs: result.latencyMs, consecutiveFailures: recentChecks.length },
            };
            firedAlerts.push(alert);
            await fireAlert(alert, rule.channels as string[]);
            await prisma.alertRule.update({
              where: { id: rule.id },
              data: { lastFiredAt: new Date() },
            });
          }
        }
      }
    }

    // Check for latency_high rules
    const latencyRules = rules.filter(
      r => r.serviceId === result.serviceId && r.condition === 'latency_high'
    );

    for (const rule of latencyRules) {
      if (result.latencyMs > rule.threshold) {
        const shouldFire = await checkCooldown(rule.id, rule.cooldownMinutes);
        if (shouldFire) {
          const alert: AlertEvent = {
            ruleId: rule.id,
            serviceId: result.serviceId,
            severity: 'warning',
            condition: 'latency_high',
            message: `${result.name} latency is ${result.latencyMs}ms (threshold: ${rule.threshold}ms)`,
            details: { latencyMs: result.latencyMs, threshold: rule.threshold },
          };
          firedAlerts.push(alert);
          await fireAlert(alert, rule.channels as string[]);
          await prisma.alertRule.update({
            where: { id: rule.id },
            data: { lastFiredAt: new Date() },
          });
        }
      }
    }
  }

  // Auto-resolve alerts when services recover
  await autoResolveAlerts(results);

  return firedAlerts;
}

/**
 * Check if cooldown period has passed since last fire.
 */
async function checkCooldown(ruleId: string, cooldownMinutes: number): Promise<boolean> {
  const rule = await prisma.alertRule.findUnique({ where: { id: ruleId } });
  if (!rule?.lastFiredAt) return true;

  const elapsed = (Date.now() - rule.lastFiredAt.getTime()) / 60000;
  return elapsed >= cooldownMinutes;
}

/**
 * Fire an alert through configured channels.
 */
async function fireAlert(alert: AlertEvent, channels: string[]): Promise<void> {
  // Always log to audit
  await prisma.alertHistory.create({
    data: {
      ruleId: alert.ruleId,
      serviceId: alert.serviceId,
      severity: alert.severity,
      condition: alert.condition,
      message: alert.message,
      details: alert.details ? (alert.details as any) : undefined,
    },
  });

  // Also log to Audit table
  await prisma.audit.create({
    data: {
      service: alert.serviceId,
      action: `alert_${alert.condition}`,
      status: alert.severity === 'critical' ? 'error' : 'success',
      errorMessage: alert.message,
      details: alert.details as any,
    },
  });

  // Email channel
  if (channels.includes('email')) {
    const adminEmail = ADMIN_EMAILS[0] || 'shai@superseller.agency';
    const severityEmoji = alert.severity === 'critical' ? '🔴' : alert.severity === 'warning' ? '🟡' : '🔵';

    await sendEmail({
      to: adminEmail,
      template: 'support-ticket', // Reuse closest template
      data: {
        ticketId: `ALERT-${alert.serviceId}`,
        subject: `${severityEmoji} [${alert.severity.toUpperCase()}] ${alert.message}`,
      },
    });
  }

  console.log(`[ALERT] ${alert.severity}: ${alert.message}`);
}

/**
 * Auto-resolve open alerts when services recover.
 */
async function autoResolveAlerts(results: HealthCheckResult[]): Promise<void> {
  for (const result of results) {
    if (result.status === 'healthy') {
      const openAlerts = await prisma.alertHistory.findMany({
        where: {
          serviceId: result.serviceId,
          resolved: false,
        },
      });

      for (const alert of openAlerts) {
        await prisma.alertHistory.update({
          where: { id: alert.id },
          data: { resolved: true, resolvedAt: new Date() },
        });

        // Log recovery
        await prisma.audit.create({
          data: {
            service: result.serviceId,
            action: 'alert_resolved',
            status: 'success',
            details: {
              alertId: alert.id,
              condition: alert.condition,
              downtime: alert.firedAt
                ? `${Math.round((Date.now() - alert.firedAt.getTime()) / 60000)} minutes`
                : 'unknown',
            } as any,
          },
        });
      }
    }
  }
}

/**
 * Seed default alert rules for all services.
 */
export async function seedDefaultRules(): Promise<number> {
  const existingCount = await prisma.alertRule.count();
  if (existingCount > 0) return 0;

  const defaults = [
    // Service down rules (2 consecutive failures)
    { serviceId: 'postgresql', condition: 'service_down', threshold: 2, cooldownMinutes: 15, channels: ['email', 'audit_log'] },
    { serviceId: 'worker', condition: 'service_down', threshold: 2, cooldownMinutes: 15, channels: ['email', 'audit_log'] },
    { serviceId: 'kie', condition: 'service_down', threshold: 3, cooldownMinutes: 30, channels: ['email', 'audit_log'] },
    { serviceId: 'gemini', condition: 'service_down', threshold: 3, cooldownMinutes: 30, channels: ['audit_log'] },
    { serviceId: 'paypal', condition: 'service_down', threshold: 2, cooldownMinutes: 15, channels: ['email', 'audit_log'] },
    { serviceId: 'ollama', condition: 'service_down', threshold: 3, cooldownMinutes: 60, channels: ['audit_log'] },
    { serviceId: 'n8n', condition: 'service_down', threshold: 5, cooldownMinutes: 120, channels: ['audit_log'] },
    // Latency rules
    { serviceId: 'postgresql', condition: 'latency_high', threshold: 2000, cooldownMinutes: 30, channels: ['audit_log'] },
    { serviceId: 'worker', condition: 'latency_high', threshold: 5000, cooldownMinutes: 30, channels: ['audit_log'] },
    { serviceId: 'paypal', condition: 'latency_high', threshold: 5000, cooldownMinutes: 60, channels: ['audit_log'] },
  ];

  for (const rule of defaults) {
    await prisma.alertRule.create({
      data: {
        ...rule,
        channels: rule.channels,
      },
    });
  }

  return defaults.length;
}

/**
 * Get unresolved alerts.
 */
export async function getActiveAlerts() {
  return prisma.alertHistory.findMany({
    where: { resolved: false },
    orderBy: { firedAt: 'desc' },
  });
}

/**
 * Get alert history (resolved + unresolved).
 */
export async function getAlertHistory(limit: number = 50) {
  return prisma.alertHistory.findMany({
    orderBy: { firedAt: 'desc' },
    take: limit,
  });
}
