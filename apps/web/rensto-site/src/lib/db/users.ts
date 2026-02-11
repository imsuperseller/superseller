/**
 * User & Auth Data Access
 * Covers: User, MagicLinkToken, CustomSolutionsClient
 */
import prisma from '@/lib/prisma';
import type { Prisma, User } from '@prisma/client';

// ---- Users ----

export async function getById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function getByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
}

export async function getByDashboardToken(token: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { dashboardToken: token } });
}

export async function getByStripeCustomerId(stripeCustomerId: string): Promise<User | null> {
  return prisma.user.findFirst({ where: { stripeCustomerId } });
}

/**
 * Get or create a user from email (mirrors ProvisioningService.getOrCreateUser).
 * Returns the user ID (email-derived).
 */
export async function getOrCreate(
  email: string,
  data?: { name?: string; stripeCustomerId?: string }
): Promise<string> {
  const normalizedEmail = email.toLowerCase().trim();
  const userId = normalizedEmail.replace(/[^a-z0-9]/g, '_');

  const existing = await prisma.user.findUnique({ where: { id: userId } });

  if (!existing) {
    await prisma.user.create({
      data: {
        id: userId,
        email: normalizedEmail,
        name: data?.name || undefined,
        status: 'active',
        emailVerified: true,
        stripeCustomerId: data?.stripeCustomerId || undefined,
        dashboardToken: crypto.randomUUID(),
        activeServices: {
          marketplace: false,
          whatsapp: false,
          subscriptions: false,
          custom_solutions: false,
          care_plan: 'none',
        },
        preferences: {
          language: 'en',
          emailNotifications: true,
          smsNotifications: false,
        },
      },
    });
  } else {
    const updates: Prisma.UserUpdateInput = {};
    if (data?.stripeCustomerId) updates.stripeCustomerId = data.stripeCustomerId;
    if (data?.name) updates.name = data.name;
    if (Object.keys(updates).length > 0) {
      await prisma.user.update({ where: { id: userId }, data: updates });
    }
  }

  return userId;
}

export async function update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
  return prisma.user.update({ where: { id }, data });
}

export async function list(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<User[]> {
  return prisma.user.findMany({
    where: params?.status ? { status: params.status } : undefined,
    take: params?.limit ?? 100,
    skip: params?.offset ?? 0,
    orderBy: { createdAt: 'desc' },
  });
}

export async function count(where?: Prisma.UserWhereInput): Promise<number> {
  return prisma.user.count({ where });
}

export async function remove(id: string): Promise<void> {
  await prisma.user.delete({ where: { id } });
}

// ---- Magic Link Tokens ----

export async function createMagicLink(data: {
  email: string;
  clientId: string;
  expiresAt: Date;
}): Promise<string> {
  const token = await prisma.magicLinkToken.create({ data });
  return token.id;
}

export async function getMagicLink(id: string) {
  return prisma.magicLinkToken.findUnique({ where: { id } });
}

export async function markMagicLinkUsed(id: string) {
  return prisma.magicLinkToken.update({ where: { id }, data: { used: true } });
}

// ---- Legacy: CustomSolutionsClient ----

export async function getCustomSolutionsClient(id: string) {
  return prisma.customSolutionsClient.findUnique({ where: { id } });
}

export async function getCustomSolutionsClientByEmail(email: string) {
  return prisma.customSolutionsClient.findFirst({
    where: { email: email.toLowerCase().trim() },
  });
}

export async function upsertCustomSolutionsClient(
  id: string,
  data: Prisma.CustomSolutionsClientCreateInput
) {
  return prisma.customSolutionsClient.upsert({
    where: { id },
    create: data,
    update: data,
  });
}
