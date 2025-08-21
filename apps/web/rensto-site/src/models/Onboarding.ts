import mongoose, { Schema, Document } from 'mongoose';

export interface IOnboardingAgent {
  name: string;
  status: 'ready' | 'error' | 'running' | 'not_configured';
  lastCheck: Date;
  notes?: string;
  config?: Record<string, any>;
}

export interface IOnboardingActionLog {
  action: string;
  timestamp: Date;
  status: 'success' | 'error' | 'pending';
  details?: string;
  toolRun?: Record<string, any>;
}

export interface IOnboarding extends Document {
  customerId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  
  // Commercial
  paid: boolean;
  invoiceId?: string;
  plan: 'basic' | 'premium' | 'enterprise';
  trial: boolean;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  
  // Access
  portalLink?: string;
  portalIssuedAt?: Date;
  appCredsIssued: boolean;
  creds?: {
    apiKey?: string;
    apiSecret?: string;
    webhookUrl?: string;
    accessToken?: string;
  };
  
  // Readiness
  requiredFields: string[];
  missing: string[];
  validated: string[];
  progressPercent: number;
  
  // Agents
  agents: IOnboardingAgent[];
  
  // Delivery
  handoffReady: boolean;
  handoffPackageUrl?: string;
  acceptedAt?: Date;
  
  // Communications
  invitedAt?: Date;
  nagsSent: number;
  lastContactChannel?: 'email' | 'sms' | 'portal' | 'agent';
  lastContactAt?: Date;
  
  // Automation
  nextAction?: string;
  lastActionLog: IOnboardingActionLog[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

const OnboardingAgentSchema = new Schema<IOnboardingAgent>({
  name: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['ready', 'error', 'running', 'not_configured'],
    default: 'not_configured'
  },
  lastCheck: { type: Date, default: Date.now },
  notes: { type: String },
  config: { type: Schema.Types.Mixed }
});

const OnboardingActionLogSchema = new Schema<IOnboardingActionLog>({
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['success', 'error', 'pending'],
    required: true
  },
  details: { type: String },
  toolRun: { type: Schema.Types.Mixed }
});

const OnboardingSchema = new Schema<IOnboarding>({
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    unique: true
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  
  // Commercial
  paid: { type: Boolean, default: false },
  invoiceId: { type: String },
  plan: { 
    type: String, 
    enum: ['basic', 'premium', 'enterprise'],
    default: 'basic'
  },
  trial: { type: Boolean, default: true },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Access
  portalLink: { type: String },
  portalIssuedAt: { type: Date },
  appCredsIssued: { type: Boolean, default: false },
  creds: {
    apiKey: { type: String },
    apiSecret: { type: String },
    webhookUrl: { type: String },
    accessToken: { type: String }
  },
  
  // Readiness
  requiredFields: [{ type: String }],
  missing: [{ type: String }],
  validated: [{ type: String }],
  progressPercent: { type: Number, default: 0, min: 0, max: 100 },
  
  // Agents
  agents: [OnboardingAgentSchema],
  
  // Delivery
  handoffReady: { type: Boolean, default: false },
  handoffPackageUrl: { type: String },
  acceptedAt: { type: Date },
  
  // Communications
  invitedAt: { type: Date },
  nagsSent: { type: Number, default: 0 },
  lastContactChannel: { 
    type: String, 
    enum: ['email', 'sms', 'portal', 'agent']
  },
  lastContactAt: { type: Date },
  
  // Automation
  nextAction: { type: String },
  lastActionLog: [OnboardingActionLogSchema]
}, {
  timestamps: true
});

// Indexes for performance
OnboardingSchema.index({ customerId: 1 }, { unique: true });
OnboardingSchema.index({ organizationId: 1 });
OnboardingSchema.index({ paid: 1 });
OnboardingSchema.index({ handoffReady: 1 });
OnboardingSchema.index({ progressPercent: 1 });
OnboardingSchema.index({ 'agents.status': 1 });
OnboardingSchema.index({ paymentStatus: 1 });
OnboardingSchema.index({ createdAt: 1 });
OnboardingSchema.index({ updatedAt: 1 });

// Pre-save middleware to calculate progress
OnboardingSchema.pre('save', function(next) {
  if (this.requiredFields.length > 0) {
    this.progressPercent = Math.round(
      (this.validated.length / this.requiredFields.length) * 100
    );
  }
  next();
});

export const Onboarding = mongoose.models.Onboarding || mongoose.model<IOnboarding>('Onboarding', OnboardingSchema);
