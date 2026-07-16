'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validation';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { useGoogleLogin } from '@react-oauth/google';

interface ApiError {
  response?: {
    data?: {
      error?: {
        message?: string;
      };
      message?: string;
    };
  };
  message?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  // Google Sign In Handler
  const googleSignIn = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setGoogleLoading(true);
      try {
        const res = await apiClient.post('/auth/google-login', {
          credential: codeResponse.access_token,
        });

        const { accessToken, user } = res.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);

        toast.success('Logged in with Google!');
        await new Promise(resolve => setTimeout(resolve, 300));
        await router.push('/dashboard');
      } catch (error: unknown) {
        const err = error as ApiError;
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Google login failed';
        toast.error(errorMessage);
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (errorResponse) => {
      toast.error(
        errorResponse.error_description ||
          errorResponse.error ||
          'Google login failed'
      );
      setGoogleLoading(false);
    },
    flow: 'implicit',
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/login', data);
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

      toast.success('Login successful!');
      await new Promise(resolve => setTimeout(resolve, 300));
      await router.push('/dashboard');
    } catch (error: unknown) {
      const err = error as ApiError;
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Login failed';

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutofillDemo = async () => {
    setValue('email', 'demo@example.com', { shouldValidate: true });
    setValue('password', 'Demo123', { shouldValidate: true });
    await trigger(['email', 'password']);
    toast.success('Demo credentials loaded!');
  };

  return (
    <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-200/50 flex flex-col md:flex-row min-h-[580px] transition-all duration-300">
      
      {/* Left Pane - Marketing/Branding */}
      <div className="md:w-5/12 bg-gradient-to-b from-[#283618] to-[#606C38] p-10 text-[#FEFAE0] flex-col justify-between hidden md:flex relative overflow-hidden">
        {/* Floating background decorative shapes */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-[#DDA15E]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Branding header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-[#FEFAE0]">
            <span className="text-3xl filter drop-shadow">💰</span>
            <span>SubTrack</span>
          </Link>
        </div>

        {/* Features Content */}
        <div className="relative z-10 my-auto py-8 space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Smart Subscription Tracker</h3>
            <p className="text-sm text-[#FEFAE0]/80 leading-relaxed font-light">
              Take back control of your spending by monitoring every subscription in a clean dashboard.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-white/10 text-white mt-0.5">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Unified View</h4>
                <p className="text-xs text-[#FEFAE0]/70 font-light">All recurring expenses in one clean list.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-white/10 text-white mt-0.5">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Smart Alerts</h4>
                <p className="text-xs text-[#FEFAE0]/70 font-light">Get warned before your cards are charged.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-white/10 text-white mt-0.5">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Analytics Hub</h4>
                <p className="text-xs text-[#FEFAE0]/70 font-light">Analyze spending patterns over time.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-[#FEFAE0]/50 font-light tracking-wide">
          Secured with industry standards
        </div>
      </div>

      {/* Right Pane - Form Panel */}
      <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-white">
        
        {/* Mobile Header */}
        <div className="md:hidden text-center mb-6">
          <div className="inline-flex items-center gap-2 text-3xl font-extrabold text-[#283618] mb-1">
            <span>💰</span> <span>SubTrack</span>
          </div>
          <p className="text-xs text-stone-500">Subscription tracking made effortless</p>
        </div>

        {/* Header */}
        <div className="mb-6 text-center md:text-left">
          <h2 className="text-3xl font-extrabold text-[#283618] tracking-tight">Welcome Back</h2>
          <p className="mt-1.5 text-stone-500 text-sm">
            Please enter your details to access your dashboard.
          </p>
        </div>

        {/* Google Sign In Button */}
        {!showManualForm && (
          <button
            type="button"
            onClick={() => {
              setGoogleLoading(true);
              googleSignIn();
            }}
            disabled={googleLoading}
            className="w-full py-3 px-4 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-gray-900 mb-4"
          >
            {googleLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in with Google...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>
        )}

        {/* Divider */}
        {!showManualForm && (
          <div className="my-5 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <div className="px-3 text-gray-600 text-sm font-medium">or</div>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>
        )}

        {/* Email Sign In Toggle */}
        {!showManualForm && (
          <button
            type="button"
            onClick={() => setShowManualForm(true)}
            className="w-full py-3 px-4 bg-[#283618] hover:bg-[#1b2610] text-[#FEFAE0] rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mb-6"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Sign in with Email
          </button>
        )}

        {/* Form */}
        {showManualForm && (
          <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Email Address
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    className={`block w-full pl-11 pr-4 py-3 border text-sm rounded-xl bg-stone-50/50 transition-all duration-200 outline-none focus:bg-white focus:ring-4 ${
                      errors.email
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                        : 'border-stone-200 focus:border-[#606C38] focus:ring-[#606C38]/10'
                    }`}
                    placeholder="name@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#BC6C25] hover:text-[#283618] font-medium transition"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={`block w-full pl-11 pr-11 py-3 border text-sm rounded-xl bg-stone-50/50 transition-all duration-200 outline-none focus:bg-white focus:ring-4 ${
                      errors.password
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                        : 'border-stone-200 focus:border-[#606C38] focus:ring-[#606C38]/10'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 transition cursor-pointer"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.025 10.025 0 014.132-5.4M9.9 4.24a9.12 9.12 0 012.1-.24c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.4M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !isValid}
                className="w-full py-3 px-4 bg-[#283618] hover:bg-[#1b2610] text-[#FEFAE0] rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-[#FEFAE0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign in'
                )}
              </button>

              {/* Back Button */}
              <button
                type="button"
                onClick={() => setShowManualForm(false)}
                className="w-full py-2 text-[#606C38] hover:text-[#283618] text-sm font-medium"
              >
                ← Back to options
              </button>
            </form>

            {/* Demo Credentials Box */}
            <div className="mt-6 bg-[#FEFAE0]/80 border border-[#FAF4B7] rounded-xl p-4 transition-all duration-200 hover:shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <p className="text-[#283618] font-bold text-xs uppercase tracking-wide">Demo Mode Available</p>
                <button
                  type="button"
                  onClick={handleAutofillDemo}
                  className="text-xs bg-[#606C38] hover:bg-[#283618] text-[#FEFAE0] px-2.5 py-1 rounded-lg font-semibold shadow-sm transition hover:scale-[1.02] cursor-pointer"
                >
                  ⚡ Click to Autofill
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-[#283618]/90 font-mono">
                <div>
                  <span className="text-[#283618]/60">Email:</span> demo@example.com
                </div>
                <div>
                  <span className="text-[#283618]/60">Pass:</span> Demo123
                </div>
              </div>
            </div>
          </>
        )}

        {/* Footnote */}
        {!showManualForm ? (
          <div className="mt-8 text-center text-sm text-stone-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-[#606C38] hover:text-[#283618] font-bold hover:underline transition"
            >
              Create free account
            </Link>
          </div>
        ) : (
          <div className="mt-8 text-center text-sm text-stone-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-[#606C38] hover:text-[#283618] font-bold hover:underline transition"
            >
              Create free account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
