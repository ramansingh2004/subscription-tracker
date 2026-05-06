import { z } from 'zod';

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Subscription Schemas
export const subscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum([
    'Entertainment',
    'Productivity',
    'Cloud Storage',
    'Utilities',
    'Developer Tools',
    'Health & Fitness',
    'Education',
    'Other',
  ]),
  cost: z.number().min(0, 'Cost must be positive'),
  currency: z.string().default('USD'),
  billingCycle: z.enum(['monthly', 'yearly', 'quarterly']).default('monthly'),
  nextRenewalDate: z.string().datetime(),
  autoRenew: z.boolean().default(true),
  notes: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  accountEmail: z.string().email().optional().or(z.literal('')),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SubscriptionInput = z.infer<typeof subscriptionSchema>;