import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  // Basic Information
  name: string;
  email: string;
  company: string;
  website?: string;
  industry: string;
  businessSize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  
  // Subscription Information
  subscription: {
    planType: 'basic' | 'professional' | 'enterprise';
    status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
  
  // Usage Tracking
  usage: {
    interactions: number;
    templates: number;
    storage: number; // in GB
    apiCalls: number;
    dataProcessing: number; // in GB
    customIntegrations: number;
  };
  
  // Billing Information
  billing: {
    stripeCustomerId?: string;
    paymentMethod?: string;
    nextBillingDate?: Date;
    billingAddress?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };
  
  // Multi-tenant Configuration
  tenant: {
    subdomain: string;
    customDomain?: string;
    theme: {
      primaryColor: string;
      secondaryColor: string;
      logo?: string;
      favicon?: string;
    };
    branding: {
      companyName: string;
      logo?: string;
      primaryColor: string;
      secondaryColor: string;
    };
    features: {
      whiteLabel: boolean;
      customIntegrations: boolean;
      advancedAnalytics: boolean;
      dedicatedSupport: boolean;
    };
  };
  
  // Customer Success
  success: {
    onboardingCompleted: boolean;
    onboardingSteps: string[];
    lastActiveDate: Date;
    healthScore: number; // 0-100
    churnRisk: 'low' | 'medium' | 'high';
    expansionOpportunities: string[];
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  tags: string[];
  notes?: string;
}

const CustomerSchema = new Schema<ICustomer>({
  // Basic Information
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  company: { type: String, required: true },
  website: { type: String },
  industry: { type: String, required: true },
  businessSize: { 
    type: String, 
    enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
    required: true 
  },
  
  // Subscription Information
  subscription: {
    planType: { 
      type: String, 
      enum: ['basic', 'professional', 'enterprise'],
      default: 'basic'
    },
    status: { 
      type: String, 
      enum: ['active', 'canceled', 'past_due', 'incomplete', 'incomplete_expired', 'trialing', 'unpaid'],
      default: 'incomplete'
    },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String }
  },
  
  // Usage Tracking
  usage: {
    interactions: { type: Number, default: 0 },
    templates: { type: Number, default: 0 },
    storage: { type: Number, default: 0 },
    apiCalls: { type: Number, default: 0 },
    dataProcessing: { type: Number, default: 0 },
    customIntegrations: { type: Number, default: 0 }
  },
  
  // Billing Information
  billing: {
    stripeCustomerId: { type: String },
    paymentMethod: { type: String },
    nextBillingDate: { type: Date },
    billingAddress: {
      line1: { type: String },
      line2: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String }
    }
  },
  
  // Multi-tenant Configuration
  tenant: {
    subdomain: { type: String, required: true, unique: true },
    customDomain: { type: String },
    theme: {
      primaryColor: { type: String, default: '#fe3d51' },
      secondaryColor: { type: String, default: '#1eaef7' },
      logo: { type: String },
      favicon: { type: String }
    },
    branding: {
      companyName: { type: String },
      logo: { type: String },
      primaryColor: { type: String },
      secondaryColor: { type: String }
    },
    features: {
      whiteLabel: { type: Boolean, default: false },
      customIntegrations: { type: Boolean, default: false },
      advancedAnalytics: { type: Boolean, default: false },
      dedicatedSupport: { type: Boolean, default: false }
    }
  },
  
  // Customer Success
  success: {
    onboardingCompleted: { type: Boolean, default: false },
    onboardingSteps: [{ type: String }],
    lastActiveDate: { type: Date, default: Date.now },
    healthScore: { type: Number, default: 0, min: 0, max: 100 },
    churnRisk: { 
      type: String, 
      enum: ['low', 'medium', 'high'],
      default: 'low'
    },
    expansionOpportunities: [{ type: String }]
  },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date },
  isActive: { type: Boolean, default: true },
  tags: [{ type: String }],
  notes: { type: String }
}, {
  timestamps: true,
  collection: 'customers'
});

// Indexes for performance
CustomerSchema.index({ email: 1 });
CustomerSchema.index({ 'tenant.subdomain': 1 });
CustomerSchema.index({ 'subscription.status': 1 });
CustomerSchema.index({ 'subscription.planType': 1 });
CustomerSchema.index({ 'success.healthScore': 1 });
CustomerSchema.index({ 'success.churnRisk': 1 });
CustomerSchema.index({ createdAt: 1 });

// Pre-save middleware
CustomerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for customer portal URL
CustomerSchema.virtual('portalUrl').get(function() {
  return `https://${this.tenant.subdomain}.rensto.com`;
});

CustomerSchema.virtual('apiEndpoint').get(function() {
  return `https://api.rensto.com/api/tenants/${this.tenant.subdomain}`;
});

// Methods
CustomerSchema.methods.updateUsage = function(usageType: string, amount: number) {
  (this as any).usage[usageType] += amount;
  (this as any).success.lastActiveDate = new Date();
  return (this as any).save();
};

CustomerSchema.methods.calculateHealthScore = function() {
  const factors = {
    onboardingCompleted: (this as any).success.onboardingCompleted ? 20 : 0,
    recentActivity: (this as any).success.lastActiveDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 20 : 0,
    usageLevel: Math.min((this as any).usage.interactions / 10, 20),
    subscriptionStatus: (this as any).subscription.status === 'active' ? 20 : 0,
    supportEngagement: 20 // Placeholder - would be calculated from support interactions
  };

  (this as any).success.healthScore = Object.values(factors).reduce((sum, score) => sum + score, 0);
  return (this as any).success.healthScore;
};

CustomerSchema.methods.assessChurnRisk = function() {
  const healthScore = (this as any).calculateHealthScore();
  
  if (healthScore >= 80) {
    (this as any).success.churnRisk = 'low';
  } else if (healthScore >= 60) {
    (this as any).success.churnRisk = 'medium';
  } else {
    (this as any).success.churnRisk = 'high';
  }
  
  return (this as any).success.churnRisk;
};

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);