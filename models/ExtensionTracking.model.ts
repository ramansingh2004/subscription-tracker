import mongoose, { Schema, Document } from 'mongoose';

export interface IExtensionTracking extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'page_visit' | 'time_on_page' | 'ad_detected' | 'paywall_detected' | 'subscription_mention';
  domain: string;
  url: string;
  timestamp: number;
  metadata?: {
    title?: string;
    favicon?: string;
    timeSpent?: number;
    mentions?: string[];
    context?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const extensionTrackingSchema = new Schema<IExtensionTracking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'page_visit',
        'time_on_page',
        'ad_detected',
        'paywall_detected',
        'subscription_mention',
      ],
      required: true,
      index: true,
    },
    domain: {
      type: String,
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Number,
      required: true,
      index: true,
    },
    metadata: {
      title: String,
      favicon: String,
      timeSpent: Number, // milliseconds
      mentions: [String], // subscription mentions
      context: String,
    },
  },
  { timestamps: true }
);

// TTL index - auto delete after 90 days
extensionTrackingSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 7776000 }
);

// Compound index for efficient querying
extensionTrackingSchema.index({ userId: 1, timestamp: -1 });
extensionTrackingSchema.index({ userId: 1, type: 1, timestamp: -1 });
extensionTrackingSchema.index({ userId: 1, domain: 1, timestamp: -1 });

export const ExtensionTracking =
  mongoose.models.ExtensionTracking ||
  mongoose.model<IExtensionTracking>(
    'ExtensionTracking',
    extensionTrackingSchema
  );