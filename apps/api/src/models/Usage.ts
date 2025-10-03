import mongoose, { Document, Schema } from 'mongoose';

export interface IUsage extends Document {
  customerId: string;
  subscriptionId: string;
  usageType: 'interactions' | 'apiCalls' | 'dataProcessing' | 'storage' | 'templates' | 'customIntegrations';
  amount: number;
  timestamp: Date;
  metadata?: {
    source?: string;
    endpoint?: string;
    userAgent?: string;
    ipAddress?: string;
  };
}

const UsageSchema = new Schema<IUsage>({
  customerId: { type: String, required: true },
  subscriptionId: { type: String, required: true },
  usageType: { 
    type: String, 
    enum: ['interactions', 'apiCalls', 'dataProcessing', 'storage', 'templates', 'customIntegrations'],
    required: true 
  },
  amount: { type: Number, required: true, min: 0 },
  timestamp: { type: Date, required: true, default: Date.now },
  metadata: {
    source: { type: String },
    endpoint: { type: String },
    userAgent: { type: String },
    ipAddress: { type: String }
  }
}, {
  timestamps: true,
  collection: 'usage'
});

// Indexes for performance
UsageSchema.index({ customerId: 1 });
UsageSchema.index({ subscriptionId: 1 });
UsageSchema.index({ usageType: 1 });
UsageSchema.index({ timestamp: 1 });
UsageSchema.index({ customerId: 1, usageType: 1, timestamp: 1 });
UsageSchema.index({ customerId: 1, timestamp: 1 });

// Compound index for analytics queries
UsageSchema.index({ 
  customerId: 1, 
  usageType: 1, 
  timestamp: 1 
});

export const Usage = mongoose.model<IUsage>('Usage', UsageSchema);
