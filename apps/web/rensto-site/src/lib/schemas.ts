import { z } from 'zod';

// ============================================================================
// CORE MODELS
// ============================================================================

export const PlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  currency: z.string().default('USD'),
  agentLimit: z.number(),
  runLimit: z.number(),
  storageLimit: z.number(), // GB
  features: z.array(z.string()),
  overagePolicy: z.enum(['warn', 'cap', 'auto-topup']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const TenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  status: z.enum(['active', 'paused', 'closed']),
  plan: PlanSchema,
  agents: z.array(z.string()), // AgentInstance IDs
  users: z.array(z.string()), // User IDs
  credentials: z.array(z.string()), // Credential IDs
  billing: z.object({
    customerId: z.string().optional(), // Stripe customer ID
    subscriptionId: z.string().optional(), // Stripe subscription ID
    currentPeriodStart: z.date().optional(),
    currentPeriodEnd: z.date().optional(),
    usage: z.object({
      agents: z.number(),
      runs: z.number(),
      storage: z.number(),
    }),
    overages: z.object({
      agents: z.number(),
      runs: z.number(),
      storage: z.number(),
    }),
  }),
  settings: z.object({
    timezone: z.string().default('UTC'),
    dateFormat: z.string().default('MM/DD/YYYY'),
    defaultApprovalBehavior: z.enum(['auto', 'manual']).default('manual'),
    branding: z.object({
      logo: z.string().optional(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
    }),
  }),
  created: z.date(),
  lastActivity: z.date(),
  updatedAt: z.date(),
});

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['owner', 'admin', 'user', 'viewer']),
  tenants: z.array(z.string()), // Tenant IDs
  mfa: z.boolean().default(false),
  lastLogin: z.date().optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    notifications: z.object({
      email: z.boolean().default(true),
      slack: z.boolean().default(false),
      inApp: z.boolean().default(true),
    }),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AgentDefinitionSchema = z.object({
  key: z.string(),
  name: z.string(),
  version: z.string(),
  description: z.string(),
  inputs: z.record(z.string(), z.any()), // JSON Schema
  outputs: z.record(z.string(), z.any()), // JSON Schema
  envRequirements: z.array(z.string()),
  category: z.enum(['content', 'social', 'analytics', 'automation', 'custom']),
  tags: z.array(z.string()),
  isDeprecated: z.boolean().default(false),
  breakingChanges: z.array(z.string()),
  compatibility: z.object({
    minVersion: z.string(),
    maxVersion: z.string().optional(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AgentInstanceSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  definitionKey: z.string(),
  definitionVersion: z.string(),
  status: z.enum(['active', 'inactive', 'error', 'queued']),
  schedule: z.string().optional(), // CRON expression
  lastRun: z.date().optional(),
  nextRun: z.date().optional(),
  settings: z.record(z.string(), z.any()),
  failures: z.array(z.object({
    timestamp: z.date(),
    error: z.string(),
    runId: z.string().optional(),
  })),
  performance: z.object({
    totalRuns: z.number().default(0),
    successfulRuns: z.number().default(0),
    averageDuration: z.number().default(0),
    totalCost: z.number().default(0),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const RunSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  agentInstanceId: z.string(),
  status: z.enum(['queued', 'running', 'completed', 'failed', 'cancelled']),
  input: z.record(z.string(), z.any()),
  output: z.record(z.string(), z.any()).optional(),
  error: z.string().optional(),
  duration: z.number().optional(), // milliseconds
  cost: z.number().optional(),
  artifacts: z.array(z.object({
    type: z.enum(['file', 'url', 'data']),
    name: z.string(),
    value: z.string(),
    size: z.number().optional(),
  })),
  metadata: z.object({
    triggeredBy: z.enum(['schedule', 'manual', 'webhook', 'api']),
    userId: z.string().optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CredentialSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  service: z.enum([
    'wordpress',
    'linkedin',
    'twitter',
    'facebook',
    'apple-podcasts',
    'spotify',
    'openrouter',
    'huggingface',
    'stripe',
    'quickbooks',
    'slack',
    'email',
    'custom'
  ]),
  label: z.string(),
  encryptedData: z.string(), // AES-256 encrypted
  health: z.object({
    status: z.enum(['healthy', 'broken', 'unknown']),
    lastCheck: z.date().optional(),
    error: z.string().optional(),
    history: z.array(z.object({
      timestamp: z.date(),
      status: z.enum(['healthy', 'broken']),
      error: z.string().optional(),
    })),
  }),
  permissions: z.array(z.string()), // Scopes/permissions
  expiresAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================================================
// BILLING & PAYMENTS
// ============================================================================

export const InvoiceSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  number: z.string(),
  amount: z.number(),
  currency: z.string().default('USD'),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
  dueDate: z.date(),
  paidDate: z.date().optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    total: z.number(),
  })),
  metadata: z.object({
    stripeInvoiceId: z.string().optional(),
    quickbooksInvoiceId: z.string().optional(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PaymentSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  invoiceId: z.string().optional(),
  amount: z.number(),
  currency: z.string().default('USD'),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  method: z.enum(['stripe', 'quickbooks', 'manual']),
  metadata: z.object({
    stripePaymentIntentId: z.string().optional(),
    quickbooksPaymentId: z.string().optional(),
    transactionId: z.string().optional(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================================================
// REPORTS & ANALYTICS
// ============================================================================

export const ReportSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  type: z.enum(['weekly', 'monthly', 'custom']),
  period: z.object({
    start: z.date(),
    end: z.date(),
  }),
  data: z.record(z.string(), z.any()),
  summary: z.object({
    totalRuns: z.number(),
    successfulRuns: z.number(),
    failedRuns: z.number(),
    totalCost: z.number(),
    averageDuration: z.number(),
  }),
  status: z.enum(['generating', 'completed', 'failed']),
  fileUrl: z.string().optional(),
  deliveredAt: z.date().optional(),
  openedAt: z.date().optional(),
  createdAt: z.date(),
});

// ============================================================================
// AUDIT & SECURITY
// ============================================================================

export const AuditLogSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  actor: z.object({
    userId: z.string().optional(),
    email: z.string().optional(),
    ipAddress: z.string(),
    userAgent: z.string(),
  }),
  tenantId: z.string().optional(),
  action: z.string(),
  resource: z.object({
    type: z.string(),
    id: z.string().optional(),
  }),
  metadata: z.record(z.string(), z.any()),
  severity: z.enum(['info', 'warning', 'error', 'critical']).default('info'),
});

// ============================================================================
// INVITES & TEAM MANAGEMENT
// ============================================================================

export const InviteSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'viewer']),
  status: z.enum(['sent', 'accepted', 'expired', 'cancelled']),
  token: z.string(),
  expiresAt: z.date(),
  acceptedAt: z.date().optional(),
  acceptedBy: z.string().optional(), // User ID
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================================================
// CONTENT APPROVALS
// ============================================================================

export const ApprovalSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  agentInstanceId: z.string(),
  runId: z.string(),
  type: z.enum(['wordpress', 'social', 'custom']),
  content: z.record(z.string(), z.any()),
  status: z.enum(['pending', 'approved', 'rejected', 'published']),
  requestedBy: z.string(), // User ID
  reviewedBy: z.string().optional(), // User ID
  reviewedAt: z.date().optional(),
  rejectionReason: z.string().optional(),
  publishedAt: z.date().optional(),
  externalId: z.string().optional(), // WordPress post ID, social post ID, etc.
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================================================
// SYSTEM HEALTH & MONITORING
// ============================================================================

export const HealthCheckSchema = z.object({
  id: z.string(),
  service: z.enum(['app', 'database', 'n8n', 'stripe', 'openrouter', 'slack']),
  status: z.enum(['healthy', 'degraded', 'down']),
  responseTime: z.number(), // milliseconds
  error: z.string().optional(),
  metadata: z.record(z.string(), z.any()),
  timestamp: z.date(),
});

export const IncidentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']),
  affectedServices: z.array(z.string()),
  startTime: z.date(),
  endTime: z.date().optional(),
  updates: z.array(z.object({
    timestamp: z.date(),
    message: z.string(),
    status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']),
  })),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================================================
// FORM SCHEMAS
// ============================================================================

export const CreateTenantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  planId: z.string().min(1, 'Plan is required'),
});

export const UpdateTenantSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  status: z.enum(['active', 'paused', 'closed']).optional(),
  planId: z.string().min(1, 'Plan is required').optional(),
  settings: z.object({
    timezone: z.string().optional(),
    dateFormat: z.string().optional(),
    defaultApprovalBehavior: z.enum(['auto', 'manual']).optional(),
    branding: z.object({
      logo: z.string().optional(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
    }).optional(),
  }).optional(),
});

export const CreateAgentInstanceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  definitionKey: z.string().min(1, 'Agent definition is required'),
  settings: z.record(z.string(), z.any()),
  schedule: z.string().optional(), // CRON expression
});

export const UpdateAgentInstanceSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  status: z.enum(['active', 'inactive']).optional(),
  settings: z.record(z.string(), z.any()).optional(),
  schedule: z.string().optional(),
});

export const CreateCredentialSchema = z.object({
  service: z.enum([
    'wordpress',
    'linkedin',
    'twitter',
    'facebook',
    'apple-podcasts',
    'spotify',
    'openrouter',
    'huggingface',
    'stripe',
    'quickbooks',
    'slack',
    'email',
    'custom'
  ]),
  label: z.string().min(1, 'Label is required'),
  data: z.record(z.string(), z.any()), // Will be encrypted
});

export const InviteUserSchema = z.object({
  email: z.string().email('Valid email is required'),
  role: z.enum(['admin', 'user', 'viewer']),
});

// ============================================================================
// API RESPONSE SCHEMAS
// ============================================================================

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    data: z.array(schema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
    }),
  });

export const ApiResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    success: z.boolean(),
    data: schema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  });

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type Plan = z.infer<typeof PlanSchema>;
export type Tenant = z.infer<typeof TenantSchema>;
export type User = z.infer<typeof UserSchema>;
export type AgentDefinition = z.infer<typeof AgentDefinitionSchema>;
export type AgentInstance = z.infer<typeof AgentInstanceSchema>;
export type Run = z.infer<typeof RunSchema>;
export type Credential = z.infer<typeof CredentialSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type Report = z.infer<typeof ReportSchema>;
export type AuditLog = z.infer<typeof AuditLogSchema>;
export type Invite = z.infer<typeof InviteSchema>;
export type Approval = z.infer<typeof ApprovalSchema>;
export type HealthCheck = z.infer<typeof HealthCheckSchema>;
export type Incident = z.infer<typeof IncidentSchema>;

// Form types
export type CreateTenant = z.infer<typeof CreateTenantSchema>;
export type UpdateTenant = z.infer<typeof UpdateTenantSchema>;
export type CreateAgentInstance = z.infer<typeof CreateAgentInstanceSchema>;
export type UpdateAgentInstance = z.infer<typeof UpdateAgentInstanceSchema>;
export type CreateCredential = z.infer<typeof CreateCredentialSchema>;
export type InviteUser = z.infer<typeof InviteUserSchema>;
