import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  slug: string;
  brandTheme: {
    primaryColor: string;
    secondaryColor: string;
    logo?: string;
    favicon?: string;
  };
  stripeCustomerId?: string;
  qbCompanyId?: string;
  features: string[];
  status: 'active' | 'suspended' | 'cancelled';
  subscriptionTier: 'free' | 'starter' | 'growth' | 'scale';
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
    lowercase: true,
    trim: true,
  },
  brandTheme: {
    primaryColor: {
      type: String,
      default: '#2F6A92',
    },
    secondaryColor: {
      type: String,
      default: '#FF6536',
    },
    logo: String,
    favicon: String,
  },
  stripeCustomerId: String,
  qbCompanyId: String,
  features: [{
    type: String,
    enum: [
      'basic_automation',
      'advanced_automation',
      'ai_insights',
      'white_label',
      'api_access',
      'priority_support',
      'custom_integrations',
    ],
  }],
  status: {
    type: String,
    enum: ['active', 'suspended', 'cancelled'],
    default: 'active',
  },
  subscriptionTier: {
    type: String,
    enum: ['free', 'starter', 'growth', 'scale'],
    default: 'free',
  },
}, {
  timestamps: true,
});

// Indexes for performance
OrganizationSchema.index({ slug: 1 });
OrganizationSchema.index({ stripeCustomerId: 1 });
OrganizationSchema.index({ status: 1 });
OrganizationSchema.index({ subscriptionTier: 1 });

export default mongoose.models.Organization || mongoose.model<IOrganization>('Organization', OrganizationSchema);
