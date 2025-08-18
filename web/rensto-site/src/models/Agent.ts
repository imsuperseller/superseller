import mongoose, { Schema, Document } from 'mongoose';

export interface IAgent extends Document {
  name: string;
  key: string;
  description: string;
  status: 'draft' | 'provisioning' | 'qa' | 'ready' | 'paused' | 'error';
  icon: string;
  tags: string[];
  capabilities: string[];
  pricing: {
    model: string;
    rate: number;
  };
  // New fields for enhanced portal
  isActive: boolean;
  schedule: 'manual' | 'daily' | 'weekly' | 'monthly';
  dependencies: string[];
  progress?: {
    current: number;
    total: number;
    message: string;
  };
  lastRun?: Date;
  successRate?: number;
  avgDuration?: number;
  costEst?: number;
  roi?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema = new Schema<IAgent>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  key: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'provisioning', 'qa', 'ready', 'paused', 'error'],
    default: 'draft',
  },
  icon: {
    type: String,
    default: '🤖',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  capabilities: [{
    type: String,
    trim: true,
  }],
  pricing: {
    model: {
      type: String,
      enum: ['per_run', 'per_month', 'per_user'],
      default: 'per_run',
    },
    rate: {
      type: Number,
      default: 0,
    },
  },
  // Enhanced fields
  isActive: {
    type: Boolean,
    default: false,
  },
  schedule: {
    type: String,
    enum: ['manual', 'daily', 'weekly', 'monthly'],
    default: 'manual',
  },
  dependencies: [{
    type: String,
    trim: true,
  }],
  progress: {
    current: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    message: {
      type: String,
      default: '',
    },
  },
  lastRun: {
    type: Date,
  },
  successRate: {
    type: Number,
    min: 0,
    max: 100,
  },
  avgDuration: {
    type: Number,
    min: 0,
  },
  costEst: {
    type: Number,
    min: 0,
  },
  roi: {
    type: Number,
    min: 0,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
AgentSchema.index({ key: 1 });
AgentSchema.index({ status: 1 });
AgentSchema.index({ isActive: 1 });
AgentSchema.index({ schedule: 1 });
AgentSchema.index({ tags: 1 });

export const Agent = mongoose.models.Agent || mongoose.model<IAgent>('Agent', AgentSchema);
