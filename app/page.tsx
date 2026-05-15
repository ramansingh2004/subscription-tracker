'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function RootPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      // User is authenticated, redirect to dashboard
      router.push('/dashboard');
    } else {
      // User is not authenticated, redirect to login
      router.push('/login');
    }
  }, [router, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">💰 SubTrack</h1>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
