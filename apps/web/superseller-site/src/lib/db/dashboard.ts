/**
 * Dashboard & Content Data Access
 * Covers: UsageLog, ContentPost, IndexedDocument, SecretaryConfig,
 *         VoiceCallLog, WhatsAppMessage, AppointmentBooking
 */
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

// ---- Usage Logs ----

export async function createUsageLog(data: Prisma.UsageLogUncheckedCreateInput) {
  return prisma.usageLog.create({ data });
}

export async function getUsageLogsByUser(userId: string, limit: number = 50) {
  return prisma.usageLog.findMany({
    where: { clientId: userId },
    take: limit,
    orderBy: { startedAt: 'desc' },
  });
}

export async function countUsageLogs(where?: Prisma.UsageLogWhereInput): Promise<number> {
  return prisma.usageLog.count({ where });
}

// ---- Content Posts ----

export async function createContentPost(data: Prisma.ContentPostUncheckedCreateInput) {
  return prisma.contentPost.create({ data });
}

export async function getContentPostsByUser(userId: string) {
  return prisma.contentPost.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPublishedPosts(params?: { type?: string; limit?: number }) {
  return prisma.contentPost.findMany({
    where: {
      status: 'published',
      ...(params?.type ? { type: params.type } : {}),
    },
    take: params?.limit ?? 20,
    orderBy: { publishedAt: 'desc' },
  });
}

export async function getContentPostBySlug(slug: string) {
  return prisma.contentPost.findFirst({ where: { slug } });
}

// ---- Indexed Documents ----

export async function createIndexedDocument(data: Prisma.IndexedDocumentUncheckedCreateInput) {
  return prisma.indexedDocument.create({ data });
}

export async function getIndexedDocumentsByUser(userId: string) {
  return prisma.indexedDocument.findMany({
    where: { clientId: userId },
    orderBy: { createdAt: 'desc' },
  });
}

// ---- Secretary Configs ----

export async function getSecretaryConfig(id: string) {
  return prisma.secretaryConfig.findUnique({ where: { id } });
}

export async function getSecretaryConfigsByUser(userId: string) {
  return prisma.secretaryConfig.findMany({
    where: { clientId: userId },
  });
}

export async function getSecretaryConfigByWebhookId(webhookId: string) {
  return prisma.secretaryConfig.findFirst({ where: { n8nWebhookId: webhookId } });
}

export async function getSecretaryConfigByPhone(phoneNumber: string) {
  return prisma.secretaryConfig.findFirst({ where: { phoneNumber } });
}

export async function upsertSecretaryConfig(
  id: string,
  data: Prisma.SecretaryConfigUncheckedCreateInput
) {
  return prisma.secretaryConfig.upsert({
    where: { id },
    create: data,
    update: data,
  });
}

// ---- Voice Call Logs ----

export async function createVoiceCallLog(data: Prisma.VoiceCallLogUncheckedCreateInput) {
  return prisma.voiceCallLog.create({ data });
}

export async function getVoiceCallLogsByUser(userId: string) {
  return prisma.voiceCallLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

// ---- WhatsApp Messages ----

export async function createWhatsAppMessage(data: Prisma.WhatsAppMessageUncheckedCreateInput) {
  return prisma.whatsAppMessage.create({ data });
}

export async function getWhatsAppMessagesByInstance(instanceId: string, limit: number = 50) {
  return prisma.whatsAppMessage.findMany({
    where: { whatsappInstanceId: instanceId },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

// ---- Appointment Bookings ----

export async function createAppointmentBooking(
  data: Prisma.AppointmentBookingUncheckedCreateInput
) {
  return prisma.appointmentBooking.create({ data });
}

export async function getAppointmentBookingsByUser(userId: string) {
  return prisma.appointmentBooking.findMany({
    where: { userId },
    orderBy: { appointmentDate: 'desc' },
  });
}

export async function getAppointmentBookingsByInstance(instanceId: string) {
  return prisma.appointmentBooking.findMany({
    where: { whatsappInstanceId: instanceId },
    orderBy: { appointmentDate: 'desc' },
  });
}
