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
  const [debugInfo, setDebugInfo] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);
    setDebugInfo('');

    try {
      const msg1 = `📝 Form data: ${JSON.stringify(data)}`;
      console.log(msg1);
      setDebugInfo(msg1);

      // Your apiClient baseURL is: http://localhost:3000/api (or NEXT_PUBLIC_API_URL/api)
      // So we call /auth/register (not /api/auth/register) to get the full path
      const msg2 = `🌐 API Base: ${apiClient.defaults.baseURL}`;
      console.log(msg2);
      setDebugInfo(prev => prev + '\n' + msg2);

      const msg3 = `📤 POST /auth/register`;
      console.log(msg3);
      setDebugInfo(prev => prev + '\n' + msg3);

      const res = await apiClient.post('/auth/register', data);

      const msg4 = `✅ Status: ${res.status}`;
      console.log(msg4);
      setDebugInfo(prev => prev + '\n' + msg4);

      console.log('Response:', res.data);
      const { accessToken, refreshToken, user } = res.data.data;

      if (!accessToken || !user) {
        setDebugInfo(prev => prev + '\n' + '❌ Missing accessToken or user in response');
        throw new Error('Invalid response - missing token or user data');
      }

      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);

      toast.success('Account created successfully!');

      setDebugInfo(prev => prev + '\n' + '✅ Redirecting to /dashboard...');
      await new Promise(resolve => setTimeout(resolve, 300));
      await router.push('/dashboard');

    } catch (error: any) {
      console.error('❌ Signup Error:', error);
      setIsLoading(false);

      let debugMsg = `\n❌ ERROR`;

      if (error.response) {
        debugMsg += `\nStatus: ${error.response.status}`;
        debugMsg += `\nURL attempted: ${error.config?.url}`;
        debugMsg += `\nBase URL: ${error.config?.baseURL}`;
        debugMsg += `\nFull URL: ${error.config?.baseURL}${error.config?.url}`;
        debugMsg += `\nResponse: ${JSON.stringify(error.response.data)}`;
      } else {
        debugMsg += `\nMessage: ${error.message}`;
      }

      setDebugInfo(prev => prev + debugMsg);

      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'Registration failed';

      toast.error(errorMessage);
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

      {debugInfo && (
        <div className="p-3 bg-cyan-50 border border-cyan-300 rounded-lg">
          <h3 className="text-xs font-bold text-cyan-900 mb-2">Debug Info:</h3>
          <p className="text-xs text-cyan-900 font-mono whitespace-pre-wrap break-words">
            {debugInfo}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              {...register('firstName')}
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John"
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              {...register('lastName')}
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            {...register('username')}
            type="text"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="johndoe"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Min 3 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            {...register('password')}
            type="password"
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
          <p className="mt-2 text-xs text-gray-600">Min 6 characters</p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition"
        >
          {isLoading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

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

      <Link
        href="/login"
        className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition text-center"
      >
        Sign in
      </Link>

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
