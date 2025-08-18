import { ObjectId } from 'mongodb';

// Base interface for all documents
export interface BaseDocument {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// User roles
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
}

// Organization interface
export interface Organization extends BaseDocument {
  name: string;
  slug: string;
  domain?: string;
  settings: {
    theme: {
      primaryColor: string;
      logo?: string;
      favicon?: string;
    };
    features: {
      aiInsights: boolean;
      marketplace: boolean;
      whiteLabel: boolean;
    };
    billing: {
      plan: 'starter' | 'growth' | 'scale';
      stripeCustomerId?: string;
      subscriptionId?: string;
    };
  };
  status: 'active' | 'suspended' | 'trial';
  trialEndsAt?: Date;
  maxUsers: number;
  maxAgents: number;
}

// User interface
export interface User extends BaseDocument {
  email: string;
  name: string;
  image?: string;
  role: UserRole;
  orgId: ObjectId;
  emailVerified?: Date;
  lastLoginAt?: Date;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  status: 'active' | 'inactive' | 'suspended';
}

// Agent interface
export interface Agent extends BaseDocument {
  name: string;
  description?: string;
  orgId: ObjectId;
  createdBy: ObjectId;
  type: 'workflow' | 'ai' | 'integration' | 'custom';
  status: 'draft' | 'active' | 'paused' | 'error';
  config: {
    workflowId?: string;
    n8nWebhookUrl?: string;
    triggers: string[];
    dataSources: string[];
    settings: Record<string, any>;
  };
  metrics: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    averageExecutionTime: number;
    lastRunAt?: Date;
  };
  tags: string[];
  isPublic: boolean;
  version: number;
}

// Agent Run interface
export interface AgentRun extends BaseDocument {
  agentId: ObjectId;
  orgId: ObjectId;
  triggeredBy: ObjectId;
  status: 'running' | 'success' | 'error' | 'cancelled';
  startedAt: Date;
  endedAt?: Date;
  durationMs: number;
  input: Record<string, any>;
  output?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    source: 'manual' | 'webhook' | 'scheduled' | 'api';
  };
}

// Data Source interface
export interface DataSource extends BaseDocument {
  name: string;
  orgId: ObjectId;
  createdBy: ObjectId;
  type: 'stripe' | 'typeform' | 'webhook' | 'mongodb' | 'api';
  status: 'connected' | 'disconnected' | 'error';
  config: {
    credentials: Record<string, any>;
    settings: Record<string, any>;
    webhookUrl?: string;
  };
  lastSyncAt?: Date;
  syncStatus: 'idle' | 'syncing' | 'error';
  error?: {
    message: string;
    lastOccurred: Date;
  };
}

// Event interface for audit trail
export interface Event extends BaseDocument {
  orgId: ObjectId;
  userId: ObjectId;
  type: string;
  action: string;
  resource: string;
  resourceId?: ObjectId;
  metadata: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// KPI interface
export interface KPI extends BaseDocument {
  orgId: ObjectId;
  name: string;
  value: number;
  target?: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  category: 'revenue' | 'usage' | 'performance' | 'engagement';
  date: Date;
}

// Subscription interface
export interface Subscription extends BaseDocument {
  orgId: ObjectId;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  plan: 'starter' | 'growth' | 'scale';
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  metadata: Record<string, any>;
}

// Collection names
export const COLLECTIONS = {
  ORGANIZATIONS: 'organizations',
  USERS: 'users',
  AGENTS: 'agents',
  AGENT_RUNS: 'agent_runs',
  DATA_SOURCES: 'data_sources',
  EVENTS: 'events',
  KPIS: 'kpis',
  SUBSCRIPTIONS: 'subscriptions',
} as const;

// Index definitions for performance
export const INDEXES = {
  [COLLECTIONS.ORGANIZATIONS]: [
    { key: { slug: 1 }, unique: true },
    { key: { domain: 1 }, sparse: true },
  ],
  [COLLECTIONS.USERS]: [
    { key: { email: 1 }, unique: true },
    { key: { orgId: 1 } },
    { key: { orgId: 1, role: 1 } },
  ],
  [COLLECTIONS.AGENTS]: [
    { key: { orgId: 1 } },
    { key: { orgId: 1, status: 1 } },
    { key: { orgId: 1, createdBy: 1 } },
    { key: { isPublic: 1, status: 1 } },
  ],
  [COLLECTIONS.AGENT_RUNS]: [
    { key: { orgId: 1 } },
    { key: { agentId: 1 } },
    { key: { orgId: 1, startedAt: -1 } },
    { key: { status: 1, startedAt: -1 } },
  ],
  [COLLECTIONS.DATA_SOURCES]: [
    { key: { orgId: 1 } },
    { key: { orgId: 1, type: 1 } },
    { key: { orgId: 1, status: 1 } },
  ],
  [COLLECTIONS.EVENTS]: [
    { key: { orgId: 1, createdAt: -1 } },
    { key: { userId: 1, createdAt: -1 } },
    { key: { type: 1, createdAt: -1 } },
  ],
  [COLLECTIONS.KPIS]: [
    { key: { orgId: 1, date: -1 } },
    { key: { orgId: 1, category: 1, date: -1 } },
  ],
  [COLLECTIONS.SUBSCRIPTIONS]: [
    { key: { orgId: 1 }, unique: true },
    { key: { stripeSubscriptionId: 1 }, unique: true },
  ],
} as const;
