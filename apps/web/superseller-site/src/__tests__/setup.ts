/**
 * Vitest Global Setup
 *
 * Mocks common externals so service-layer tests run without
 * real database connections, network calls, or side effects.
 */
import { vi } from 'vitest';

// ---------------------------------------------------------------------------
// 1. Prisma — default-export + named-export mock
//    Every model method returns a no-op by default.
//    Individual tests can override with vi.mocked(prisma.user.findUnique).mockResolvedValue(...)
// ---------------------------------------------------------------------------
vi.mock('@/lib/prisma', () => {
  const createModelMock = () => ({
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
    count: vi.fn().mockResolvedValue(0),
    aggregate: vi.fn(),
    groupBy: vi.fn(),
  });

  const prismaMock = {
    user: createModelMock(),
    serviceInstance: createModelMock(),
    subscription: { ...createModelMock(), updateMany: vi.fn() },
    payment: createModelMock(),
    lead: createModelMock(),
    creditTransaction: createModelMock(),
    videoJob: createModelMock(),
    contentPost: createModelMock(),
    platformAccount: createModelMock(),
    magicLinkToken: createModelMock(),
    entitlement: createModelMock(),
    usageEvent: createModelMock(),
    tenant: createModelMock(),
    tenantUser: createModelMock(),
    competeAllowlist: createModelMock(),
    customSolutionsClient: createModelMock(),
    $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn(prismaMock)),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
  };

  return {
    default: prismaMock,
    prisma: prismaMock,
  };
});

// ---------------------------------------------------------------------------
// 2. Additional module mocks
// ---------------------------------------------------------------------------
vi.mock('@/lib/paypal', () => ({
  verifyWebhookSignature: vi.fn().mockResolvedValue(true),
  getSubscriptionDetails: vi.fn(),
  createOrder: vi.fn(),
  captureOrder: vi.fn(),
}));

vi.mock('@/lib/agents/ServiceAuditAgent', () => ({
  auditAgent: { log: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock('@/lib/email', () => ({
  emails: {
    invoiceReceipt: vi.fn().mockResolvedValue(undefined),
    welcome: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/lib/credits', () => ({
  CreditService: {
    addCredits: vi.fn().mockResolvedValue(undefined),
    deductCredits: vi.fn().mockResolvedValue(undefined),
    refundCredits: vi.fn().mockResolvedValue(undefined),
    getBalance: vi.fn().mockResolvedValue(0),
    checkBalance: vi.fn().mockResolvedValue(0),
  },
}));

vi.mock('@/lib/rate-limiter', () => ({
  authRateLimiter: { middleware: () => () => null },
  apiRateLimiter: { middleware: () => () => null },
}));

vi.mock('@/lib/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

// ---------------------------------------------------------------------------
// 3. Global fetch mock — returns empty 200 by default
//    Override per-test: vi.mocked(fetch).mockResolvedValueOnce(...)
// ---------------------------------------------------------------------------
vi.stubGlobal(
  'fetch',
  vi.fn().mockResolvedValue(
    new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }),
  ),
);
