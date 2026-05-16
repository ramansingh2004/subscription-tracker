import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'SubTrack - Subscription Manager',
  description: 'Track and manage all your subscriptions in one place',
  icons: {
    icon: '💰',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <ReactQueryProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10b981',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#ef4444',
                },
              },
            }}
          />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
