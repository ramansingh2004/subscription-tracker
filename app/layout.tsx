import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'SubTrack - Subscription Manager',
  description: 'Track and manage all your subscriptions in one place',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-blue-50">
        <ReactQueryProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#283618',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#606C38',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#606C38',
                },
              },
              error: {
                style: {
                  background: '#BC6C25',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#BC6C25',
                },
              },
            }}
          />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
