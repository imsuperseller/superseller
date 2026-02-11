/**
 * Leads & Outreach Data Access
 * Covers: Lead, LeadRequest, OutreachCampaign, ResponseTimeMetrics
 */
import prisma from '@/lib/prisma';
import type { Prisma, Lead } from '@prisma/client';

// ---- Leads ----

export async function createLead(data: Prisma.LeadUncheckedCreateInput): Promise<Lead> {
  return prisma.lead.create({ data });
}

export async function getLead(id: string): Promise<Lead | null> {
  return prisma.lead.findUnique({ where: { id } });
}

export async function getLeadsByUser(userId: string, params?: {
  status?: string;
  source?: string;
  limit?: number;
}): Promise<Lead[]> {
  return prisma.lead.findMany({
    where: {
      userId,
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.source ? { source: params.source } : {}),
    },
    take: params?.limit ?? 100,
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateLead(id: string, data: Prisma.LeadUpdateInput): Promise<Lead> {
  return prisma.lead.update({ where: { id }, data });
}

export async function getUnsyncedLeads(limit: number = 50): Promise<Lead[]> {
  return prisma.lead.findMany({
    where: { syncedToAITable: false },
    take: limit,
    orderBy: { createdAt: 'asc' },
  });
}

export async function markLeadsSynced(ids: string[]): Promise<void> {
  await prisma.lead.updateMany({
    where: { id: { in: ids } },
    data: { syncedToAITable: true },
  });
}

// ---- Lead Requests ----

export async function createLeadRequest(data: Prisma.LeadRequestUncheckedCreateInput) {
  return prisma.leadRequest.create({ data });
}

export async function getLeadRequestsByUser(userId: string) {
  return prisma.leadRequest.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

// ---- Outreach Campaigns ----

export async function getOutreachCampaignsByUser(userId: string) {
  return prisma.outreachCampaign.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createOutreachCampaign(data: Prisma.OutreachCampaignUncheckedCreateInput) {
  return prisma.outreachCampaign.create({ data });
}

// ---- Response Time Metrics ----

export async function getResponseTimeMetrics(userId: string, period?: string) {
  return prisma.responseTimeMetrics.findMany({
    where: {
      userId,
      ...(period ? { period } : {}),
    },
    orderBy: { periodStart: 'desc' },
  });
}

export async function createResponseTimeMetrics(
  data: Prisma.ResponseTimeMetricsUncheckedCreateInput
) {
  return prisma.responseTimeMetrics.create({ data });
}
