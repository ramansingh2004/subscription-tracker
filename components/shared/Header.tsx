'use client';

import { useAuth } from '@/lib/hooks';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-blue-200/50 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
      <div>
        <h1 className="text-2xl font-bold text-blue-600">
          Subscription Tracker
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-gray-700">
          Welcome, {user?.firstName}!
        </span>
        <button
          onClick={logout}
          className="text-red-600 hover:text-red-700 font-medium"
        >
          Logout
        </button>
      </div>
    </header>
  );
}