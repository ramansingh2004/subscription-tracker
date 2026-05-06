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
  category: string;
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
  createdAt: Date;
  updatedAt: Date;
}

//used in Notification.model.ts
export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'renewal' | 'recommendation' | 'report' | 'share';
  title: string;
  message: string;
  subscriptionId?: mongoose.Types.ObjectId;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
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
>;