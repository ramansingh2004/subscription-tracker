'use client';

import { useEffect } from 'react';

export default function RootPage() {
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      window.location.replace('/dashboard');
    } else {
      window.location.replace('/landing');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">💰 SubTrack</h1>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
