import mongoose, { Schema, Document } from 'mongoose';
import { ISubscription } from '@/typesDefined';

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'Entertainment',
        'Productivity',
        'Cloud Storage',
        'Utilities',
        'Developer Tools',
        'Health & Fitness',
        'Education',
        'Other',
      ],
      required: true,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly', 'quarterly'],
      default: 'monthly',
    },
    nextRenewalDate: {
      type: Date,
      required: true,
      index: true,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled'],
      default: 'active',
      index: true,
    },
    notes: String,
    website: String,
    accountEmail: String,
    logoUrl: String,
    tags: [String],
  },
  { timestamps: true }
);

// Indexes for common queries
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ userId: 1, nextRenewalDate: 1 });

export const Subscription =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>('Subscription', subscriptionSchema);