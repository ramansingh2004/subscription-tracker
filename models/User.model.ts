import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '@/typesDefined';


const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true,
      required: function (this: IUser): boolean {
        return !this.googleId;
      },
    },
    passwordHash: {
      type: String,
      required: function (this: IUser): boolean {
        return !this.googleId;
      },
    },
    firstName: String,
    lastName: String,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    // Google OAuth fields
    googleId: { type: String, unique: true, sparse: true },
    googleEmail: String,
    googleName: String,
    googleImage: String,
    oauthProvider: {
      type: String,
      enum: ['google', 'manual'],
      default: 'manual',
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      currency: {
        type: String,
        default: 'USD',
      },
      notificationFrequency: {
        type: String,
        enum: ['instant', 'daily', 'weekly'],
        default: 'instant',
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  if (!this.passwordHash) return;

  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
