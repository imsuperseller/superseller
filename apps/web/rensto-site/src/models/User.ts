import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  organizationId: mongoose.Types.ObjectId;
  role: 'admin' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: Date;
  preferences?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'viewer'],
    default: 'user',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active',
  },
  lastLogin: {
    type: Date,
  },
  preferences: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Create indexes for better query performance
UserSchema.index({ organizationId: 1, email: 1 }, { unique: true });
UserSchema.index({ email: 1 }); // For email lookups
UserSchema.index({ organizationId: 1, role: 1 }); // For role-based queries
UserSchema.index({ organizationId: 1, status: 1 }); // For status-based queries
UserSchema.index({ lastLogin: 1 }); // For login tracking
UserSchema.index({ createdAt: 1 }); // For time-based queries
UserSchema.index({ organizationId: 1, createdAt: 1 }); // For organization time-based queries

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
