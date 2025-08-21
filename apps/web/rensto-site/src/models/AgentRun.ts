import mongoose, { Schema, Document } from 'mongoose';

export interface IAgentRun extends Document {
  agentId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  n8nExecutionId: string;
  status: 'success' | 'error' | 'running' | 'cancelled';
  startedAt: Date;
  endedAt?: Date;
  metrics: {
    durationMs: number;
    nodes: number;
    retries: number;
    tokensIn: number;
    tokensOut: number;
    costUSD: number;
  };
  error?: {
    message: string;
    node: string;
    rollbarId?: string;
  };
  samples: {
    input: Record<string, unknown>;
    output: Record<string, unknown>;
  };
  triggeredBy: 'manual' | 'schedule' | 'webhook' | 'api';
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AgentRunSchema = new Schema<IAgentRun>({
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'Agent',
    required: true,
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  n8nExecutionId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['success', 'error', 'running', 'cancelled'],
    default: 'running',
  },
  startedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endedAt: Date,
  metrics: {
    durationMs: {
      type: Number,
      default: 0,
    },
    nodes: {
      type: Number,
      default: 0,
    },
    retries: {
      type: Number,
      default: 0,
    },
    tokensIn: {
      type: Number,
      default: 0,
    },
    tokensOut: {
      type: Number,
      default: 0,
    },
    costUSD: {
      type: Number,
      default: 0,
    },
  },
  error: {
    message: String,
    node: String,
    rollbarId: String,
  },
  samples: {
    input: {
      type: Schema.Types.Mixed,
      default: {},
    },
    output: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  triggeredBy: {
    type: String,
    enum: ['manual', 'schedule', 'webhook', 'api'],
    default: 'manual',
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes for performance
AgentRunSchema.index({ organizationId: 1 });
AgentRunSchema.index({ agentId: 1 });
AgentRunSchema.index({ status: 1 });
AgentRunSchema.index({ startedAt: -1 });
AgentRunSchema.index({ n8nExecutionId: 1 });
AgentRunSchema.index({ organizationId: 1, agentId: 1, startedAt: -1 });

export default mongoose.models.AgentRun || mongoose.model<IAgentRun>('AgentRun', AgentRunSchema);
