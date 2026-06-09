import mongoose, { Schema, Document } from 'mongoose';
import { INotificationQueue } from '@/typesDefined';

const notificationQueueSchema = new Schema<INotificationQueue>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    notifications: [
      {
        type: {
          type: String,
          enum: ['renewal', 'recommendation', 'report', 'share'],
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        subscriptionId: Schema.Types.ObjectId,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
      index: true,
    },
    scheduledFor: {
      type: Date,
      required: true,
      index: true,
    },
    sentAt: Date,
    failureReason: String,
    emailSent: {
      type: Boolean,
      default: false,
    },
    inAppCreated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for finding pending notifications scheduled for delivery
notificationQueueSchema.index({ status: 1, scheduledFor: 1 });

// TTL index - auto delete after 90 days
notificationQueueSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export const NotificationQueue =
  mongoose.models.NotificationQueue ||
  mongoose.model<INotificationQueue>('NotificationQueue', notificationQueueSchema);