import { Inter } from 'next/font/google';
import './globals.css';
import Profile from '../components/Profile';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { metadata } from './metadata';
import StarfieldWrapper from '../components/StarfieldWrapper';
import UserProviderWrapper from '../components/UserProviderWrapper';
import SecureConnectionIndicator from '../components/SecureConnectionIndicator';
import { Suspense } from 'react';
import ClientErrorBoundary from '../components/ClientErrorBoundary';
import Providers from '../components/providers';

const inter = Inter({ subsets: ['latin'] });

export { metadata };

function ErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
        <p className="mb-4">We&apos;re experiencing technical difficulties. Please try again later.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-quantify bg-black text-white min-h-screen antialiased overflow-x-hidden text-sm">
        <ClientErrorBoundary>
          <Providers>
            <UserProviderWrapper>
              <div className="relative min-h-screen flex flex-col">
                <StarfieldWrapper />

                {/* Minimal MobiGlass UI decorations */}
                <div className="fixed inset-0 pointer-events-none">
                  {/* Subtle corner brackets */}
                  <div className="fixed top-0 left-0 w-24 h-24 border-l border-t border-[rgba(var(--mg-primary),0.15)] z-10"></div>
                  <div className="fixed top-0 right-0 w-24 h-24 border-r border-t border-[rgba(var(--mg-primary),0.15)] z-10"></div>
                  <div className="fixed bottom-0 left-0 w-24 h-24 border-l border-b border-[rgba(var(--mg-primary),0.15)] z-10"></div>
                  <div className="fixed bottom-0 right-0 w-24 h-24 border-r border-b border-[rgba(var(--mg-primary),0.15)] z-10"></div>

                  {/* Very subtle noise texture (moved to file URL to avoid data URI issues) */}
                  <div className="fixed inset-0 bg-[url('/assets/noise.svg')] opacity-[0.02] mix-blend-overlay z-10"></div>

                  {/* Subtle scan line */}
                  <div className="fixed top-0 left-0 w-full h-[1px] bg-[rgba(var(--mg-primary),0.4)] shadow-[0_0_8px_rgba(var(--mg-primary),0.3)] animate-scan-line z-20"></div>

                  {/* Very subtle line noise */}
                  <div className="fixed inset-0 overflow-hidden opacity-[0.01] z-10">
                    <div className="absolute inset-0 line-noise"></div>
                  </div>
                </div>

                <div className="relative z-20 flex flex-col flex-1">
                  <header className="flex flex-col">
                    <Suspense fallback={<div>Loading profile...</div>}>
                      <Profile />
                    </Suspense>
                    <Suspense fallback={<div>Loading navigation...</div>}>
                      <Navigation />
                    </Suspense>
                  </header>
                  <main className="flex-1">
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading content...</div>}>
                      {children}
                    </Suspense>
                  </main>
                  <Footer />
                </div>

                {/* Secure Connection Indicator - only shows when user is logged in */}
                <SecureConnectionIndicator />
              </div>
            </UserProviderWrapper>
          </Providers>
        </ClientErrorBoundary>
      </body>
    </html>
  );
} 
