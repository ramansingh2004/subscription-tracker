import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const message = error.response?.data?.error?.message || error.message;
    const code = error.response?.data?.error?.code;

    // Handle specific status codes
    if (status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }

    if (status === 403) {
      toast.error('You do not have permission to perform this action');
    }

    if (status === 404) {
      toast.error('Resource not found');
    }

    if (status === 500) {
      toast.error('Server error. Please try again later');
    }

    return { message, code, status };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'An unknown error occurred' };
}

export function logError(error: unknown, context?: string) {
  console.error(`[${context || 'Error'}]`, error);

  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production') {
    // Send to error tracking service
  }
}