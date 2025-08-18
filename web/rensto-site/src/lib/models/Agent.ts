import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['automation', 'analytics', 'communication', 'integration'],
    default: 'automation'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'error', 'running'],
    default: 'inactive'
  },
  configuration: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  schedule: {
    enabled: {
      type: Boolean,
      default: false
    },
    cron: {
      type: String,
      trim: true
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  metrics: {
    totalRuns: {
      type: Number,
      default: 0
    },
    successfulRuns: {
      type: Number,
      default: 0
    },
    failedRuns: {
      type: Number,
      default: 0
    },
    averageExecutionTime: {
      type: Number,
      default: 0
    },
    lastRun: {
      type: Date
    },
    lastSuccess: {
      type: Date
    },
    lastError: {
      type: Date
    }
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps on save
agentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes (removed duplicates)
agentSchema.index({ key: 1 });
agentSchema.index({ organization: 1 });
agentSchema.index({ status: 1 });

export const Agent = mongoose.models.Agent || mongoose.model('Agent', agentSchema);
