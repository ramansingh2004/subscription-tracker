import mongoose, { Schema, Document } from 'mongoose';

//used in User.model.ts
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  username: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  // Google OAuth
  googleId?: string;
  googleEmail?: string;
  googleName?: string;
  googleImage?: string;
  oauthProvider?: 'google' | 'manual';
  preferences: {
    theme: 'light' | 'dark';
    currency: string;
    notificationFrequency: 'instant' | 'daily' | 'weekly';
    emailNotifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

//used in Subscription.model.ts
export interface ISubscription extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  category:
    | 'Streaming'
    | 'Software'
    | 'Productivity'
    | 'Entertainment'
    | 'Education'
    | 'Health'
    | 'Other';
  cost: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'quarterly';
  nextRenewalDate: Date;
  autoRenew: boolean;
  status: 'active' | 'paused' | 'cancelled';
  notes?: string;
  website?: string;
  accountEmail?: string;
  logoUrl?: string;
  tags?: string[];
  reminderSent7Days: boolean;
  reminderSentToday: boolean;
  lastReminderSentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

//used in Notification.model.ts
export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'reminder' | 'upgrade' | 'alert';
  title: string;
  message: string;
  subscriptionId?: mongoose.Types.ObjectId;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface INotificationQueue extends Document {
  userId: mongoose.Types.ObjectId;
  notifications: Array<{
    type: 'renewal' | 'recommendation' | 'report' | 'share';
    title: string;
    message: string;
    subscriptionId?: mongoose.Types.ObjectId;
    createdAt: Date;
  }>;
  status: 'pending' | 'sent' | 'failed';
  scheduledFor: Date; // When to send this batch
  sentAt?: Date;
  failureReason?: string;
  emailSent: boolean;
  inAppCreated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

//used for other purposes
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuthResponse {
  user: Omit<IUser, 'passwordHash' | 'emailVerificationToken'>;
  accessToken: string;
  refreshToken?: string;
}

export type UserWithoutPassword = Omit<
  IUser,
  'passwordHash' | 'emailVerificationToken' | 'passwordResetToken'
>

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}