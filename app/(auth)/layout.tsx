import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication | Subscription Tracker',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100/40 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}