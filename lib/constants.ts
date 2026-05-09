export const SUBSCRIPTION_CATEGORIES = [
  'Streaming',
  'Software',
  'Productivity',
  'Entertainment',
  'Education',
  'Health',
  'Other',
] as const;

export const BILLING_CYCLES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'quarterly', label: 'Quarterly' },
] as const;

export const SUBSCRIPTION_STATUSES = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'paused', label: 'Paused', color: 'yellow' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
] as const;

export const NOTIFICATION_TYPES = [
  { value: 'reminder', label: 'Reminder', color: 'blue' },
  { value: 'upgrade', label: 'Upgrade', color: 'green' },
  { value: 'alert', label: 'Alert', color: 'red' },
] as const;

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
] as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  SUBSCRIPTIONS: '/subscriptions',
  SUBSCRIPTIONS_NEW: '/subscriptions/new',
  ANALYTICS: '/analytics',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
} as const;

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_SIGNUP: '/auth/register',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_ME: '/auth/me',
  AUTH_REFRESH: '/auth/refresh',

  // Subscriptions
  SUBSCRIPTIONS: '/subscriptions',
  SUBSCRIPTIONS_UPCOMING: '/subscriptions/upcoming',

  // Analytics
  ANALYTICS_SUMMARY: '/analytics/summary',
  ANALYTICS_CATEGORIES: '/analytics/categories',

  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_UNREAD: '/notifications/unread',
} as const;

export const MESSAGES = {
  SUCCESS: {
    CREATED: 'Created successfully',
    UPDATED: 'Updated successfully',
    DELETED: 'Deleted successfully',
    LOGIN: 'Logged in successfully',
    LOGOUT: 'Logged out successfully',
  },
  ERROR: {
    NETWORK: 'Network error. Please check your connection',
    SERVER: 'Server error. Please try again later',
    VALIDATION: 'Please check your input and try again',
    UNAUTHORIZED: 'Unauthorized. Please login again',
    FORBIDDEN: 'You do not have permission to perform this action',
  },
} as const;