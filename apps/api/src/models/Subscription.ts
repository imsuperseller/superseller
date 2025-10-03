import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  customerId: string;
  stripeSubscriptionId: string;
  planType: 'basic' | 'professional' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  features: {
    interactions: number;
    templates: number;
    users: number;
    apiCalls: number;
    storage: number;
    integrations: number;
    aiFeatures?: boolean;
    analytics?: boolean;
    whiteLabel?: boolean;
    customIntegrations?: boolean;
    dedicatedSupport?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
  customerId: { type: String, required: true },
  stripeSubscriptionId: { type: String, required: true, unique: true },
  planType: { 
    type: String, 
    enum: ['basic', 'professional', 'enterprise'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'canceled', 'past_due', 'incomplete', 'incomplete_expired', 'trialing', 'unpaid'],
    required: true 
  },
  currentPeriodStart: { type: Date, required: true },
  currentPeriodEnd: { type: Date, required: true },
  features: {
    interactions: { type: Number, required: true },
    templates: { type: Number, required: true },
    users: { type: Number, required: true },
    apiCalls: { type: Number, required: true },
    storage: { type: Number, required: true },
    integrations: { type: Number, required: true },
    aiFeatures: { type: Boolean, default: false },
    analytics: { type: Boolean, default: false },
    whiteLabel: { type: Boolean, default: false },
    customIntegrations: { type: Boolean, default: false },
    dedicatedSupport: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'subscriptions'
});

// Indexes for performance
SubscriptionSchema.index({ customerId: 1 });
SubscriptionSchema.index({ stripeSubscriptionId: 1 });
SubscriptionSchema.index({ planType: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ currentPeriodStart: 1 });
SubscriptionSchema.index({ currentPeriodEnd: 1 });

// Pre-save middleware
SubscriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
