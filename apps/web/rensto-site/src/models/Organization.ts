import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  slug: string;
  domain?: string;
  settings: {
    timezone: string;
    currency: string;
    language: string;
    features: string[];
  };
  billing: {
    plan: 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'suspended' | 'cancelled';
    nextBillingDate?: Date;
    totalSpent: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  domain: {
    type: String,
    trim: true,
  },
  settings: {
    timezone: {
      type: String,
      default: 'UTC',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    language: {
      type: String,
      default: 'en',
    },
    features: [{
      type: String,
      trim: true,
    }],
  },
  billing: {
    plan: {
      type: String,
      enum: ['basic', 'premium', 'enterprise'],
      default: 'basic',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'cancelled'],
      default: 'active',
    },
    nextBillingDate: {
      type: Date,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
});

// Indexes
OrganizationSchema.index({ slug: 1 }, { unique: true });
OrganizationSchema.index({ domain: 1 });
OrganizationSchema.index({ 'billing.status': 1 });
OrganizationSchema.index({ 'billing.plan': 1 });
OrganizationSchema.index({ createdAt: 1 });

export const Organization = mongoose.models.Organization || mongoose.model<IOrganization>('Organization', OrganizationSchema);
