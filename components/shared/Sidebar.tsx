'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Subscriptions', href: '/subscriptions' },
  { name: 'Analytics', href: '/analytics' },
  { name: 'Notifications', href: '/notifications' },
  { name: 'Settings', href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-blue-600 text-blue-50 border-r border-blue-700/30 shadow-xl">
      <div className="px-6 py-8">
        <Link href="/" className="text-2xl font-bold text-blue-50 tracking-tight flex items-center gap-2 hover:opacity-90 transition">
          <span>💰</span> <span>Track</span>
        </Link>
      </div>

      <nav className="px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                isActive
                  ? 'bg-blue-200 text-blue-600 shadow-sm'
                  : 'text-blue-100/80 hover:bg-blue-700 hover:text-blue-50'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}