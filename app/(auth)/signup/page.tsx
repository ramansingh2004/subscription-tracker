'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '@/lib/validation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export default function SignupPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur', // Validate on blur for better UX
  });

  const password = watch('password');

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);

    try {
      // Send only required fields to backend
      const { confirmPassword, ...submitData } = data;

      const res = await apiClient.post('/auth/register', submitData);
      const { accessToken, refreshToken, user } = res.data.data;

      if (!accessToken || !user) {
        throw new Error('Invalid response - missing token or user data');
      }

      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);

      toast.success('Account created successfully!');

      await new Promise(resolve => setTimeout(resolve, 300));
      await router.push('/dashboard');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'Registration failed';

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">💰 SubTrack</h1>
        <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
        <p className="mt-2 text-gray-600">
          Start tracking your subscriptions today
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* First Name & Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name *
            </label>
            <input
              {...register('firstName')}
              type="text"
              className={`mt-1 block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.firstName
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                ⚠️ {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name *
            </label>
            <input
              {...register('lastName')}
              type="text"
              className={`mt-1 block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.lastName
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                ⚠️ {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username *
          </label>
          <input
            {...register('username')}
            type="text"
            className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.username
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="johndoe"
          />
          {errors.username ? (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              ⚠️ {errors.username.message}
            </p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">
              3-30 characters, letters, numbers, underscores, hyphens
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            {...register('email')}
            type="email"
            className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.email
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              ⚠️ {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password *
          </label>
          <input
            {...register('password')}
            type="password"
            className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.password
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="••••••"
          />
          {errors.password ? (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              ⚠️ {errors.password.message}
            </p>
          ) : (
            <p className="mt-1 text-xs text-gray-500">
              Min 6 characters, uppercase, lowercase, number
            </p>
          )}

          {/* Password strength indicator */}
          {password && !errors.password && (
            <div className="mt-2 flex gap-1">
              <div className="flex-1 h-1 bg-green-500 rounded"></div>
              <div className="flex-1 h-1 bg-green-500 rounded"></div>
              <div className="flex-1 h-1 bg-green-500 rounded"></div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Confirm Password *
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.confirmPassword
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="••••••"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              ⚠️ {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition duration-200"
        >
          {isLoading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-blue-50 text-gray-500">
            Already have an account?
          </span>
        </div>
      </div>

      {/* Sign In Link */}
      <Link
        href="/login"
        className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition text-center"
      >
        Sign in
      </Link>

      {/* Terms */}
      <p className="text-xs text-gray-600 text-center">
        By signing up, you agree to our{' '}
        <Link href="#" className="text-blue-600 hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="#" className="text-blue-600 hover:underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}