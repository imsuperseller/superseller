/**
 * Payments & Purchases Data Access
 * Covers: Payment, Purchase, Download
 */
import prisma from '@/lib/prisma';
import type { Prisma, Payment, Purchase } from '@prisma/client';

// ---- Payments ----

export async function createPayment(data: Prisma.PaymentUncheckedCreateInput): Promise<Payment> {
  return prisma.payment.create({ data });
}

export async function getPaymentsByUser(userId: string): Promise<Payment[]> {
  return prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPaymentByStripeSession(stripeSessionId: string): Promise<Payment | null> {
  return prisma.payment.findFirst({ where: { stripeSessionId } });
}

export async function countPayments(where?: Prisma.PaymentWhereInput): Promise<number> {
  return prisma.payment.count({ where });
}

export async function getRecentPayments(limit: number = 20): Promise<Payment[]> {
  return prisma.payment.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
  });
}

// ---- Purchases ----

export async function createPurchase(data: Prisma.PurchaseUncheckedCreateInput): Promise<Purchase> {
  return prisma.purchase.create({ data });
}

export async function getPurchaseByToken(downloadToken: string): Promise<Purchase | null> {
  return prisma.purchase.findFirst({ where: { downloadToken } });
}

export async function getPurchasesByUser(userId: string): Promise<Purchase[]> {
  return prisma.purchase.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

// ---- Downloads ----

export async function createDownload(data: Prisma.DownloadUncheckedCreateInput) {
  return prisma.download.create({ data });
}

export async function getDownloadsByTemplate(templateId: string) {
  return prisma.download.findMany({
    where: { templateId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function countDownloads(where?: Prisma.DownloadWhereInput): Promise<number> {
  return prisma.download.count({ where });
}
