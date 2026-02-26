/**
 * Service Delivery Data Access
 * Covers: ServiceInstance, Subscription, CarePlanDeliverable, WhatsAppInstance
 */
import prisma from '@/lib/prisma';
import type { Prisma, ServiceInstance, Subscription, WhatsAppInstance } from '@prisma/client';

// ---- Service Instances ----

export async function createServiceInstance(
  data: Prisma.ServiceInstanceUncheckedCreateInput
): Promise<ServiceInstance> {
  return prisma.serviceInstance.create({ data });
}

export async function getServiceInstance(id: string): Promise<ServiceInstance | null> {
  return prisma.serviceInstance.findUnique({ where: { id } });
}

export async function getServiceInstancesByUser(userId: string): Promise<ServiceInstance[]> {
  return prisma.serviceInstance.findMany({
    where: { clientId: userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getServiceInstancesByStatus(status: string): Promise<ServiceInstance[]> {
  return prisma.serviceInstance.findMany({
    where: { status },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateServiceInstance(
  id: string,
  data: Prisma.ServiceInstanceUpdateInput
): Promise<ServiceInstance> {
  return prisma.serviceInstance.update({ where: { id }, data });
}

// ---- Subscriptions ----

export async function createSubscription(
  data: Prisma.SubscriptionUncheckedCreateInput
): Promise<Subscription> {
  return prisma.subscription.create({ data });
}

export async function getSubscription(id: string): Promise<Subscription | null> {
  return prisma.subscription.findUnique({ where: { id } });
}

export async function getSubscriptionsByUser(userId: string): Promise<Subscription[]> {
  return prisma.subscription.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
  return prisma.subscription.findFirst({ where: { stripeSubscriptionId } });
}

export async function updateSubscription(
  id: string,
  data: Prisma.SubscriptionUpdateInput
): Promise<Subscription> {
  return prisma.subscription.update({ where: { id }, data });
}

// ---- WhatsApp Instances ----

export async function createWhatsAppInstance(
  data: Prisma.WhatsAppInstanceUncheckedCreateInput
): Promise<WhatsAppInstance> {
  return prisma.whatsAppInstance.create({ data });
}

export async function getWhatsAppInstance(id: string): Promise<WhatsAppInstance | null> {
  return prisma.whatsAppInstance.findUnique({ where: { id } });
}

export async function getWhatsAppInstancesByUser(userId: string): Promise<WhatsAppInstance[]> {
  return prisma.whatsAppInstance.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateWhatsAppInstance(
  id: string,
  data: Prisma.WhatsAppInstanceUpdateInput
): Promise<WhatsAppInstance> {
  return prisma.whatsAppInstance.update({ where: { id }, data });
}

// ---- Care Plan Deliverables ----

export async function createCarePlanDeliverable(
  data: Prisma.CarePlanDeliverableUncheckedCreateInput
) {
  return prisma.carePlanDeliverable.create({ data });
}

export async function getCarePlanDeliverablesByUser(userId: string) {
  return prisma.carePlanDeliverable.findMany({
    where: { userId },
    orderBy: { periodStart: 'desc' },
  });
}

export async function getCarePlanDeliverablesBySubscription(subscriptionId: string) {
  return prisma.carePlanDeliverable.findMany({
    where: { subscriptionId },
    orderBy: { periodStart: 'desc' },
  });
}

// ---- Provisioning Transaction ----

/**
 * Atomic provisioning: creates user, purchase, service instance, and updates
 * entitlements in a single Postgres transaction. Replaces multi-write Firestore flow.
 */
export async function provisionMarketplaceTemplate(params: {
  userId: string;
  email: string;
  name?: string;
  templateId: string;
  productName: string;
  stripeSessionId: string;
  downloadToken: string;
  downloadUrl: string;
  tier?: string;
  createServiceInstance?: boolean;
}) {
  return prisma.$transaction(async (tx) => {
    // 1. Ensure user exists
    const user = await tx.user.findUnique({ where: { id: params.userId } });
    if (!user) throw new Error(`User ${params.userId} not found`);

    // 2. Create purchase record
    const purchase = await tx.purchase.create({
      data: {
        userId: params.userId,
        templateId: params.templateId,
        customerEmail: params.email,
        stripeSessionId: params.stripeSessionId,
        downloadToken: params.downloadToken,
        downloadUrl: params.downloadUrl,
        tier: params.tier,
      },
    });

    // 3. Optionally create service instance (Core 7)
    let serviceInstance = null;
    if (params.createServiceInstance) {
      serviceInstance = await tx.serviceInstance.create({
        data: {
          clientId: params.userId,
          clientEmail: params.email,
          productId: params.templateId,
          productName: params.productName,
          status: 'pending_setup',
          type: 'marketplace_implementation',
          stripeSessionId: params.stripeSessionId,
        },
      });
    }

    return { purchase, serviceInstance };
  });
}

/**
 * Atomic provisioning for managed plan (WhatsApp subscriptions).
 */
export async function provisionManagedPlan(params: {
  userId: string;
  email: string;
  productId: string;
  productName: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  whatsappBundle?: string;
  amount: number;
}) {
  return prisma.$transaction(async (tx) => {
    // 1. Create subscription
    const subscription = await tx.subscription.create({
      data: {
        userId: params.userId,
        userEmail: params.email,
        stripeSubscriptionId: params.stripeSubscriptionId,
        stripeCustomerId: params.stripeCustomerId,
        subscriptionType: 'whatsapp',
        whatsappBundle: params.whatsappBundle || 'manual_custom',
        amount: params.amount,
        status: 'active',
        currentPeriodStart: new Date(),
      },
    });

    // 2. Create WhatsApp instance
    const whatsappInstance = await tx.whatsAppInstance.create({
      data: {
        userId: params.userId,
        userEmail: params.email,
        businessName: `${params.productName} Business`,
        bundle: params.whatsappBundle || 'custom',
        status: 'pending_setup',
        subscriptionId: subscription.id,
      },
    });

    return { subscription, whatsappInstance };
  });
}
