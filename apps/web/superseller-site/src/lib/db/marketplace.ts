/**
 * Marketplace Data Access
 * Covers: Template, CustomizationRequest, Solution, SolutionInstance
 */
import prisma from '@/lib/prisma';
import type { Prisma, Template, Solution } from '@prisma/client';

// ---- Templates ----

export async function getTemplate(id: string): Promise<Template | null> {
  return prisma.template.findUnique({ where: { id } });
}

export async function listActiveTemplates(): Promise<Template[]> {
  return prisma.template.findMany({
    where: {
      readinessStatus: 'Active',
      showInMarketplace: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function listTemplates(params?: {
  readinessStatus?: string;
  category?: string;
  limit?: number;
}): Promise<Template[]> {
  return prisma.template.findMany({
    where: {
      readinessStatus: params?.readinessStatus,
      category: params?.category,
    },
    take: params?.limit ?? 100,
    orderBy: { createdAt: 'desc' },
  });
}

export async function createTemplate(data: Prisma.TemplateCreateInput): Promise<Template> {
  return prisma.template.create({ data });
}

export async function updateTemplate(
  id: string,
  data: Prisma.TemplateUpdateInput
): Promise<Template> {
  return prisma.template.update({ where: { id }, data });
}

export async function deleteTemplate(id: string): Promise<void> {
  await prisma.template.delete({ where: { id } });
}

// ---- Customization Requests ----

export async function createCustomizationRequest(
  data: Prisma.CustomizationRequestUncheckedCreateInput
) {
  return prisma.customizationRequest.create({ data });
}

// ---- Solutions ----

export async function getSolution(id: string): Promise<Solution | null> {
  return prisma.solution.findUnique({ where: { id } });
}

export async function listActiveSolutions(): Promise<Solution[]> {
  return prisma.solution.findMany({
    where: { status: 'active' },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createSolution(data: Prisma.SolutionCreateInput): Promise<Solution> {
  return prisma.solution.create({ data });
}

// ---- Solution Instances ----

export async function getSolutionInstancesByUser(clientId: string) {
  return prisma.solutionInstance.findMany({
    where: { clientId },
    include: { solution: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateSolutionInstance(
  id: string,
  data: Prisma.SolutionInstanceUpdateInput
) {
  return prisma.solutionInstance.update({ where: { id }, data });
}
