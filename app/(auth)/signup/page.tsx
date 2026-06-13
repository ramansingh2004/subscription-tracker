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
import { useGoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

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

export default function SignupPage() {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <SignupPageContent />
    </GoogleOAuthProvider>
  );
}

function SignupPageContent() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
  });

  const password = watch('password');

  // Google Sign Up Handler
  const googleSignUp = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setGoogleLoading(true);
      try {
        const res = await apiClient.post('/auth/google-signup', {
          credential: codeResponse.access_token,
        });

        const { accessToken, user } = res.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);

        toast.success('Account created with Google!');
        await new Promise(resolve => setTimeout(resolve, 300));
        await router.push('/dashboard');
      } catch (error: unknown) {
        const err = error as ApiError;
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Google signup failed';
        toast.error(errorMessage);
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error('Google signup failed');
      setGoogleLoading(false);
    },
    flow: 'implicit',
  });

  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    return score;
  };

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true);

    try {
      const { confirmPassword: _confirmPassword, ...submitData } = data;

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
    } catch (error: unknown) {
      const err = error as ApiError;
      const errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        'Registration failed';

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-200/50 flex flex-col md:flex-row min-h-[620px] transition-all duration-300">
      
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
            <h3 className="text-xl font-bold text-white">Join SubTrack Today</h3>
            <p className="text-sm text-[#FEFAE0]/80 leading-relaxed font-light">
              Start your subscription optimization journey in less than two minutes.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-white/10 text-white mt-0.5 animate-pulse">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Stop Leaking Cash</h4>
                <p className="text-xs text-[#FEFAE0]/70 font-light">Identify unused subscriptions and cancel them.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-white/10 text-white mt-0.5">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Clear Visualization</h4>
                <p className="text-xs text-[#FEFAE0]/70 font-light">Get interactive tables and calendars of your bills.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-white/10 text-white mt-0.5">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Zero Hassle Setup</h4>
                <p className="text-xs text-[#FEFAE0]/70 font-light">No credit card required. Free forever dashboard.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-[#FEFAE0]/50 font-light tracking-wide">
          Your data security is our top priority
        </div>
      </div>

      {/* Right Pane - Form Panel */}
      <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-white overflow-y-auto max-h-screen md:max-h-none">
        
        {/* Mobile Header */}
        <div className="md:hidden text-center mb-6">
          <div className="inline-flex items-center gap-2 text-3xl font-extrabold text-[#283618] mb-1">
            <span>💰</span> <span>SubTrack</span>
          </div>
          <p className="text-xs text-stone-500">Track and optimize your subscriptions</p>
        </div>

        {/* Header */}
        <div className="mb-6 text-center md:text-left">
          <h2 className="text-3xl font-extrabold text-[#283618] tracking-tight">Create Account</h2>
          <p className="mt-1.5 text-stone-500 text-sm">
            Sign up to start tracking your subscriptions today.
          </p>
        </div>

        {/* Google Sign Up Button */}
        {!showManualForm && (
          <button
            type="button"
            onClick={() => googleSignUp()}
            disabled={googleLoading}
            className="w-full py-3 px-4 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-gray-900 mb-4"
          >
            {googleLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing up with Google...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign up with Google
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

        {/* Email Sign Up Toggle */}
        {!showManualForm && (
          <button
            type="button"
            onClick={() => setShowManualForm(true)}
            className="w-full py-3 px-4 bg-[#283618] hover:bg-[#1b2610] text-[#FEFAE0] rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mb-6"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Sign up with Email
          </button>
        )}

        {/* Form */}
        {showManualForm && (
          <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                    First Name
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      {...register('firstName')}
                      type="text"
                      className={`block w-full pl-11 pr-4 py-2.5 border text-sm rounded-xl bg-stone-50/50 transition-all duration-200 outline-none focus:bg-white focus:ring-4 ${
                        errors.firstName
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                          : 'border-stone-200 focus:border-[#606C38] focus:ring-[#606C38]/10'
                      }`}
                      placeholder="John"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      ⚠️ {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                    Last Name
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      {...register('lastName')}
                      type="text"
                      className={`block w-full pl-11 pr-4 py-2.5 border text-sm rounded-xl bg-stone-50/50 transition-all duration-200 outline-none focus:bg-white focus:ring-4 ${
                        errors.lastName
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                          : 'border-stone-200 focus:border-[#606C38] focus:ring-[#606C38]/10'
                      }`}
                      placeholder="Doe"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      ⚠️ {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Username
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    {...register('username')}
                    type="text"
                    className={`block w-full pl-11 pr-4 py-2.5 border text-sm rounded-xl bg-stone-50/50 transition-all duration-200 outline-none focus:bg-white focus:ring-4 ${
                      errors.username
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                        : 'border-stone-200 focus:border-[#606C38] focus:ring-[#606C38]/10'
                    }`}
                    placeholder="johndoe"
                  />
                </div>
                {errors.username ? (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    ⚠️ {errors.username.message}
                  </p>
                ) : (
                  <p className="text-[10px] text-stone-400">
                    3-30 characters, letters, numbers, underscores, hyphens
                  </p>
                )}
              </div>

              {/* Email */}
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
                    className={`block w-full pl-11 pr-4 py-2.5 border text-sm rounded-xl bg-stone-50/50 transition-all duration-200 outline-none focus:bg-white focus:ring-4 ${
                      errors.email
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                        : 'border-stone-200 focus:border-[#606C38] focus:ring-[#606C38]/10'
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    ⚠️ {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={`block w-full pl-11 pr-11 py-2.5 border text-sm rounded-xl bg-stone-50/50 transition-all duration-200 outline-none focus:bg-white focus:ring-4 ${
                      errors.password
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                        : 'border-stone-200 focus:border-[#606C38] focus:ring-[#606C38]/10'
                    }`}
                    placeholder="••••••"
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
                {errors.password ? (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    ⚠️ {errors.password.message}
                  </p>
                ) : (
                  <p className="text-[10px] text-stone-400">
                    Min 6 characters, uppercase, lowercase, number
                  </p>
                )}

                {/* Password strength indicator */}
                {password && !errors.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => {
                        const strength = getPasswordStrength();
                        const isActive = strength >= level;
                        let colorClass = 'bg-stone-100';
                        if (isActive) {
                          if (strength <= 1) colorClass = 'bg-red-400';
                          else if (strength <= 2) colorClass = 'bg-orange-400';
                          else if (strength <= 3) colorClass = 'bg-yellow-400';
                          else colorClass = 'bg-green-500';
                        }
                        return (
                          <div key={level} className={`flex-1 h-1 rounded-full transition-all duration-300 ${colorClass}`}></div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-stone-500">
                      <span>Strength: {
                        getPasswordStrength() === 0 ? 'Empty' :
                        getPasswordStrength() === 1 ? 'Weak' :
                        getPasswordStrength() === 2 ? 'Fair' :
                        getPasswordStrength() === 3 ? 'Good' : 'Strong!'
                      }</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Confirm Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`block w-full pl-11 pr-11 py-2.5 border text-sm rounded-xl bg-stone-50/50 transition-all duration-200 outline-none focus:bg-white focus:ring-4 ${
                      errors.confirmPassword
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                        : 'border-stone-200 focus:border-[#606C38] focus:ring-[#606C38]/10'
                    }`}
                    placeholder="••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 transition cursor-pointer"
                  >
                    {showConfirmPassword ? (
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
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    ⚠️ {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#283618] hover:bg-[#1b2610] text-[#FEFAE0] rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-[#FEFAE0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating account...</span>
                  </>
                ) : (
                  'Sign up'
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
          </>
        )}

        {/* Footnote & Terms */}
        {!showManualForm ? (
          <div className="mt-6 text-center space-y-4">
            <p className="text-xs text-stone-500 leading-relaxed">
              By signing up, you agree to our{' '}
              <Link href="#" className="text-[#606C38] font-semibold hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" className="text-[#606C38] font-semibold hover:underline">
                Privacy Policy
              </Link>
            </p>

            <div className="w-full border-t border-stone-100" />

            <p className="text-sm text-stone-500">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-[#606C38] hover:text-[#283618] font-bold hover:underline transition"
              >
                Sign in
              </Link>
            </p>
          </div>
        ) : (
          <div className="mt-6 text-center space-y-4">
            <p className="text-xs text-stone-500 leading-relaxed">
              By signing up, you agree to our{' '}
              <Link href="#" className="text-[#606C38] font-semibold hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" className="text-[#606C38] font-semibold hover:underline">
                Privacy Policy
              </Link>
            </p>

            <div className="w-full border-t border-stone-100" />

            <p className="text-sm text-stone-500">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-[#606C38] hover:text-[#283618] font-bold hover:underline transition"
              >
                Sign in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}