import { Notification } from '@/models/Notification.model';
import { Types } from 'mongoose';

export interface CreateNotificationOptions {
  userId: string | Types.ObjectId;
  type: 'renewal' | 'recommendation' | 'report' | 'share';
  title: string;
  message: string;
  subscriptionId?: string | Types.ObjectId;
}

export const createNotification = async (options: CreateNotificationOptions) => {
  try {
    const notification = new Notification({
      userId: options.userId,
      type: options.type,
      title: options.title,
      message: options.message,
      subscriptionId: options.subscriptionId || null,
      read: false,
    });

    await notification.save();
    console.log(`✅ Notification created for user ${options.userId}`);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};