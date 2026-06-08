import { z } from 'zod';

// ============ PASSWORD VALIDATION ============
const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .describe('Strong password with uppercase, lowercase, and numbers');

const weakPasswordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .describe('Basic password validation');

// ============ AUTH SCHEMAS ============

export const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name is too long')
      .regex(/^[a-zA-Z\s'-]*$/, 'First name contains invalid characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name is too long')
      .regex(/^[a-zA-Z\s'-]*$/, 'Last name contains invalid characters'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must not exceed 30 characters')
      .regex(
        /^[a-zA-Z0-9_-]*$/,
        'Username can only contain letters, numbers, underscores, and hyphens'
      ),
    email: z
      .string()
      .email('Please enter a valid email address')
      .max(255, 'Email is too long')
      .toLowerCase(),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z
      .string()
      .email('Invalid email address')
      .max(255, 'Email is too long')
      .toLowerCase(),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must not exceed 30 characters')
      .regex(
        /^[a-zA-Z0-9_-]*$/,
        'Username can only contain letters, numbers, underscores, and hyphens'
      ),
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: z
      .string()
      .max(50, 'First name is too long')
      .optional(),
    lastName: z
      .string()
      .max(50, 'Last name is too long')
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// ============ PASSWORD RESET SCHEMAS ============

export const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .toLowerCase(),
});

export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ============ SUBSCRIPTION SCHEMAS ============

const CATEGORIES = [
  'Entertainment',
  'Productivity',
  'Cloud Storage',
  'Utilities',
  'Developer Tools',
  'Health & Fitness',
  'Education',
  'Other',
] as const;

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR'] as const;
const BILLING_CYCLES = ['monthly', 'yearly', 'quarterly'] as const;
const STATUSES = ['active', 'paused', 'cancelled'] as const;

export const subscriptionSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Subscription name is required')
      .max(100, 'Subscription name is too long')
      .trim(),
    category: z
      .enum(CATEGORIES, {
        message: 'Please select a valid category',
      }),
    cost: z
      .number()
      .positive('Cost must be greater than 0')
      .max(999999, 'Cost is too high')
      .finite('Cost must be a valid number')
      .refine((val) => val.toString().split('.')[1]?.length <= 2, {
        message: 'Cost must have at most 2 decimal places',
      }),
    currency: z
      .enum(CURRENCIES, {
        message: 'Please select a valid currency',
      })
      .default('USD'),
    billingCycle: z
      .enum(BILLING_CYCLES, {
        message: 'Please select a valid billing cycle',
      })
      .default('monthly'),
    nextRenewalDate: z
      .string()
      .min(1, 'Renewal date is required')
      .refine((date) => !isNaN(new Date(date).getTime()), {
        message: 'Please enter a valid date',
      })
      .refine((date) => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)), {
        message: 'Renewal date must be today or in the future',
      }),
    autoRenew: z.boolean().default(true),
    status: z
      .enum(STATUSES, {
        message: 'Please select a valid status',
      })
      .default('active'),
    notes: z
      .string()
      .max(500, 'Notes must not exceed 500 characters')
      .optional()
      .or(z.literal('')),
    website: z
      .string()
      .url('Please enter a valid URL')
      .optional()
      .or(z.literal('')),
    accountEmail: z
      .string()
      .email('Please enter a valid email address')
      .optional()
      .or(z.literal('')),
    logoUrl: z
      .string()
      .url('Please enter a valid image URL')
      .optional()
      .or(z.literal('')),
    tags: z
      .array(
        z
          .string()
          .min(1, 'Tag cannot be empty')
          .max(20, 'Tag is too long')
      )
      .max(10, 'You can add maximum 10 tags')
      .optional(),
  })
  .strict();

export type SubscriptionInput = z.input<typeof subscriptionSchema>;

// ============ SETTINGS/PREFERENCES SCHEMAS ============

export const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark'], {
    message: 'Please select a valid theme',
  }),
  currency: z.enum(CURRENCIES, {
    message: 'Please select a valid currency',
  }),
  notificationFrequency: z.enum(['instant', 'daily', 'weekly'], {
    message: 'Please select a valid notification frequency',
  }),
  emailNotifications: z.boolean(),
});

export type PreferencesInput = z.infer<typeof preferencesSchema>;

export const userSettingsSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name is too long')
      .regex(/^[a-zA-Z\s'-]*$/, 'First name contains invalid characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name is too long')
      .regex(/^[a-zA-Z\s'-]*$/, 'Last name contains invalid characters'),
    email: z
      .string()
      .email('Please enter a valid email address')
      .max(255, 'Email is too long')
      .toLowerCase(),
  })
  .merge(preferencesSchema);

export type UserSettingsInput = z.infer<typeof userSettingsSchema>;

// ============ SEARCH & FILTER SCHEMAS ============

export const subscriptionFilterSchema = z.object({
  page: z
    .number()
    .int('Page must be an integer')
    .positive('Page must be greater than 0')
    .default(1),
  limit: z
    .number()
    .int('Limit must be an integer')
    .positive('Limit must be greater than 0')
    .max(100, 'Limit cannot exceed 100')
    .default(10),
  category: z
    .enum(['All', ...CATEGORIES])
    .default('All'),
  search: z
    .string()
    .max(100, 'Search query is too long')
    .optional()
    .or(z.literal('')),
  sortBy: z
    .enum(['createdAt', 'name', 'cost', 'nextRenewalDate'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type SubscriptionFilterInput = z.infer<typeof subscriptionFilterSchema>;

// ============ NOTIFICATION SCHEMA ============

export const notificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  type: z.enum(['renewal', 'recommendation', 'report', 'share'], {
    message: 'Please select a valid notification type',
  }),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title is too long'),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(1000, 'Message is too long'),
  subscriptionId: z.string().optional(),
});

export type NotificationInput = z.infer<typeof notificationSchema>;

// ============ VALIDATION ERROR HANDLING ============

export const validateFormData = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors;
      return {
        success: false,
        data: null,
        error: fieldErrors,
      };
    }
    return {
      success: false,
      data: null,
      error: { general: ['An unexpected error occurred'] },
    };
  }
};

// ============ API REQUEST VALIDATION ============

export const apiValidationMiddleware = (schema: z.ZodSchema) => {
  return (data: unknown) => {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw {
          status: 400,
          message: 'Validation error',
          errors: error.flatten().fieldErrors,
        };
      }
      throw error;
    }
  };
};