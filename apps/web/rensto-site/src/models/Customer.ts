import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  organizationId: mongoose.Types.ObjectId;
  status: 'active' | 'inactive' | 'prospect' | 'lead';
  plan: 'basic' | 'premium' | 'enterprise';
  source: 'website' | 'referral' | 'social' | 'advertising' | 'other';
  tags: string[];
  notes?: string;
  lastContact?: Date;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospect', 'lead'],
    default: 'prospect',
  },
  plan: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    default: 'basic',
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'social', 'advertising', 'other'],
    default: 'website',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  notes: {
    type: String,
    trim: true,
  },
  lastContact: {
    type: Date,
  },
  totalSpent: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Create indexes for better query performance
CustomerSchema.index({ organizationId: 1, email: 1 }); // For organization email lookups
CustomerSchema.index({ organizationId: 1, status: 1 }); // For status-based queries
CustomerSchema.index({ organizationId: 1, plan: 1 }); // For plan-based queries
CustomerSchema.index({ organizationId: 1, source: 1 }); // For source-based queries
CustomerSchema.index({ organizationId: 1, tags: 1 }); // For tag-based queries
CustomerSchema.index({ organizationId: 1, lastContact: 1 }); // For contact tracking
CustomerSchema.index({ organizationId: 1, createdAt: 1 }); // For time-based queries
CustomerSchema.index({ organizationId: 1, totalSpent: 1 }); // For revenue queries
CustomerSchema.index({ email: 1 }); // For global email lookups
CustomerSchema.index({ company: 1 }); // For company searches

export const Customer = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
