'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';
import AuthProvider from '../components/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

// Dynamically import the Starfield component with no SSR
const DynamicStarfield = dynamic(() => import('../components/Starfield'), {
  ssr: false
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-quantify bg-black text-white min-h-screen antialiased overflow-x-hidden">
        <AuthProvider>
          <div className="relative min-h-screen">
            <DynamicStarfield />
            <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none"></div>
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
} 