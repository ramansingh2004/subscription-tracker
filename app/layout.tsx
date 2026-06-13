import { Toaster } from 'react-hot-toast';
import {GoogleOAuthProvider} from "@react-oauth/google";
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { CurrencyProvider } from '@/components/providers/CurrencyProvider';
import './globals.css';

export const metadata = {
  title: "SubTrack - Stop Wasting Money on Subscriptions",
  description: "SubTrack automatically detects subscriptions, tracks spending, and helps you save $500+ annually on unwanted services.",
  keywords: "subscription tracker, subscription management, save money",
  openGraph: {
    title: "SubTrack",
    description: "Track every subscription and save money",
    image: "/og-image.png",
    url: "https://subscription-tracker-five-puce.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "SubTrack",
    description: "Stop wasting money on forgotten subscriptions",
    image: "/twitter-image.png",
  }
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
          <CurrencyProvider>
            <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID || ''}>
              {children}
            </GoogleOAuthProvider>
          </CurrencyProvider>
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
