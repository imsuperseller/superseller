/**
 * Admin & Support Data Access
 * Covers: SupportCase, ApprovalRequest, Testimonial, OnboardingRequest,
 *         Audit, LaunchTask, Proposal, Scorecard, Consultation,
 *         Requirement, OptimizerAudit, AdminConversation, N8nAgentMemory,
 *         Analytics, BusinessNiche, VaultItem
 */
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

// ---- Support Cases ----

export async function createSupportCase(data: Prisma.SupportCaseUncheckedCreateInput) {
  return prisma.supportCase.create({ data });
}

export async function getSupportCasesByUser(userId: string) {
  return prisma.supportCase.findMany({
    where: { customerId: userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateSupportCase(id: string, data: Prisma.SupportCaseUpdateInput) {
  return prisma.supportCase.update({ where: { id }, data });
}

export async function getSupportCase(id: string) {
  return prisma.supportCase.findUnique({ where: { id } });
}

// ---- Approval Requests ----

export async function createApprovalRequest(data: Prisma.ApprovalRequestUncheckedCreateInput) {
  return prisma.approvalRequest.create({ data });
}

export async function getApprovalRequestsByUser(userId: string, status?: string) {
  return prisma.approvalRequest.findMany({
    where: { clientId: userId, ...(status ? { status } : {}) },
    orderBy: { requestedAt: 'desc' },
  });
}

export async function updateApprovalRequest(id: string, data: Prisma.ApprovalRequestUpdateInput) {
  return prisma.approvalRequest.update({ where: { id }, data });
}

// ---- Testimonials ----

export async function listTestimonials(params?: { isActive?: boolean; language?: string }) {
  return prisma.testimonial.findMany({
    where: {
      ...(params?.isActive !== undefined ? { isActive: params.isActive } : {}),
      ...(params?.language ? { language: params.language } : {}),
    },
    orderBy: { order: 'asc' },
  });
}

export async function createTestimonial(data: Prisma.TestimonialUncheckedCreateInput) {
  return prisma.testimonial.create({ data });
}

export async function updateTestimonial(id: string, data: Prisma.TestimonialUpdateInput) {
  return prisma.testimonial.update({ where: { id }, data });
}

export async function deleteTestimonial(id: string) {
  await prisma.testimonial.delete({ where: { id } });
}

// ---- Onboarding Requests ----

export async function createOnboardingRequest(
  data: Prisma.OnboardingRequestUncheckedCreateInput
) {
  return prisma.onboardingRequest.create({ data });
}

export async function getOnboardingRequestsByStatus(status: string) {
  return prisma.onboardingRequest.findMany({
    where: { status },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateOnboardingRequest(
  id: string,
  data: Prisma.OnboardingRequestUpdateInput
) {
  return prisma.onboardingRequest.update({ where: { id }, data });
}

export async function getOnboardingRequest(id: string) {
  return prisma.onboardingRequest.findUnique({ where: { id } });
}

// ---- Audit Trail ----

export async function createAudit(data: Prisma.AuditCreateInput) {
  return prisma.audit.create({ data });
}

export async function getRecentAudits(limit: number = 50) {
  return prisma.audit.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAuditsByService(service: string, limit: number = 50) {
  return prisma.audit.findMany({
    where: { service },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

// ---- Launch Tasks ----

export async function listLaunchTasks(status?: string) {
  return prisma.launchTask.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
  });
}

export async function createLaunchTask(data: Prisma.LaunchTaskCreateInput) {
  return prisma.launchTask.create({ data });
}

export async function updateLaunchTask(id: string, data: Prisma.LaunchTaskUpdateInput) {
  return prisma.launchTask.update({ where: { id }, data });
}

// ---- Proposals ----

export async function createProposal(data: Prisma.ProposalUncheckedCreateInput) {
  return prisma.proposal.create({ data });
}

export async function getProposalsByUser(userId: string) {
  return prisma.proposal.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

// ---- Scorecards ----

export async function createScorecard(data: Prisma.ScorecardUncheckedCreateInput) {
  return prisma.scorecard.create({ data });
}

export async function countScorecards(where?: Prisma.ScorecardWhereInput): Promise<number> {
  return prisma.scorecard.count({ where });
}

// ---- Consultations ----

export async function createConsultation(data: Prisma.ConsultationUncheckedCreateInput) {
  return prisma.consultation.create({ data });
}

export async function countConsultations(where?: Prisma.ConsultationWhereInput): Promise<number> {
  return prisma.consultation.count({ where });
}

// ---- Requirements ----

export async function createRequirement(data: Prisma.RequirementCreateInput) {
  return prisma.requirement.create({ data });
}

export async function countRequirements(where?: Prisma.RequirementWhereInput): Promise<number> {
  return prisma.requirement.count({ where });
}

// ---- Admin Conversations (Terry) ----

export async function getOrCreateConversation(id: string) {
  return prisma.adminConversation.upsert({
    where: { id },
    create: { id, messages: [] },
    update: {},
  });
}

export async function updateConversation(id: string, messages: Prisma.InputJsonValue[]) {
  return prisma.adminConversation.update({
    where: { id },
    data: { messages },
  });
}

// ---- n8n Agent Memory ----

export async function getAgentMemory(key: string) {
  return prisma.n8nAgentMemory.findFirst({ where: { key } });
}

export async function upsertAgentMemory(key: string, data: Prisma.InputJsonValue) {
  const existing = await prisma.n8nAgentMemory.findFirst({ where: { key } });
  if (existing) {
    return prisma.n8nAgentMemory.update({
      where: { id: existing.id },
      data: { data, key },
    });
  }
  return prisma.n8nAgentMemory.create({ data: { key, data } });
}

// ---- Analytics ----

export async function createAnalytics(data: Prisma.AnalyticsCreateInput) {
  return prisma.analytics.create({ data });
}

// ---- Business Niches ----

export async function listActiveNiches() {
  return prisma.businessNiche.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
}

export async function getNicheBySlug(slug: string) {
  return prisma.businessNiche.findUnique({ where: { slug } });
}

// ---- Vault Items ----

export async function getVaultItem(category: string, key: string) {
  return prisma.vaultItem.findUnique({
    where: { category_key: { category, key } },
  });
}

export async function setVaultItem(category: string, key: string, value: string, metadata?: unknown) {
  return prisma.vaultItem.upsert({
    where: { category_key: { category, key } },
    create: { category, key, value, metadata: metadata as Prisma.InputJsonValue },
    update: { value, metadata: metadata as Prisma.InputJsonValue },
  });
}

export async function listVaultItems(category: string) {
  return prisma.vaultItem.findMany({
    where: { category },
    orderBy: { key: 'asc' },
  });
}
