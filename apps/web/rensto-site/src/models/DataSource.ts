import mongoose, { Schema, Document } from 'mongoose';

export interface IDataSource extends Document {
  name: string;
  type: 'apify' | 'n8n' | 'facebook' | 'stripe' | 'custom';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  icon: string;
  credentials: {
    apiKey?: string;
    endpoint?: string;
    username?: string;
    isConfigured: boolean;
    encrypted?: boolean;
  };
  setupInstructions?: {
    title: string;
    steps: string[];
    pricingUrl?: string;
    signupUrl?: string;
  };
  lastSync?: Date;
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DataSourceSchema = new Schema<IDataSource>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['apify', 'n8n', 'facebook', 'stripe', 'custom'],
    required: true,
  },
  status: {
    type: String,
    enum: ['connected', 'disconnected', 'error', 'pending'],
    default: 'disconnected',
  },
  icon: {
    type: String,
    default: '🔗',
  },
  credentials: {
    apiKey: {
      type: String,
      select: false, // Don't include in queries by default
    },
    endpoint: String,
    username: String,
    isConfigured: {
      type: Boolean,
      default: false,
    },
    encrypted: {
      type: Boolean,
      default: false,
    },
  },
  setupInstructions: {
    title: String,
    steps: [String],
    pricingUrl: String,
    signupUrl: String,
  },
  lastSync: Date,
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
DataSourceSchema.index({ organizationId: 1 });
DataSourceSchema.index({ type: 1 });
DataSourceSchema.index({ status: 1 });
DataSourceSchema.index({ organizationId: 1, type: 1 }, { unique: true });

// Virtual for masked API key
DataSourceSchema.virtual('credentials.maskedApiKey').get(function() {
  if (this.credentials?.apiKey) {
    const key = this.credentials.apiKey;
    return key.length > 8 ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : '***';
  }
  return undefined;
});

export const DataSource = mongoose.models.DataSource || mongoose.model<IDataSource>('DataSource', DataSourceSchema);
