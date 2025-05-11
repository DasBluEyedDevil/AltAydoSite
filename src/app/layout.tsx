import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '../components/AuthProvider';
import Profile from '../components/Profile';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { metadata } from './metadata';
import StarfieldWrapper from '../components/StarfieldWrapper';

const inter = Inter({ subsets: ['latin'] });

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-quantify bg-black text-white min-h-screen antialiased overflow-x-hidden text-sm">
        <AuthProvider>
          <div className="relative min-h-screen flex flex-col">
            <StarfieldWrapper />
            
            {/* Minimal MobiGlass UI decorations */}
            <div className="fixed inset-0 pointer-events-none">
              {/* Subtle corner brackets */}
              <div className="fixed top-0 left-0 w-24 h-24 border-l border-t border-[rgba(var(--mg-primary),0.15)] z-10"></div>
              <div className="fixed top-0 right-0 w-24 h-24 border-r border-t border-[rgba(var(--mg-primary),0.15)] z-10"></div>
              <div className="fixed bottom-0 left-0 w-24 h-24 border-l border-b border-[rgba(var(--mg-primary),0.15)] z-10"></div>
              <div className="fixed bottom-0 right-0 w-24 h-24 border-r border-b border-[rgba(var(--mg-primary),0.15)] z-10"></div>
              
              {/* Very subtle noise texture */}
              <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iLjA1IiBkPSJNMCAwaDMwMHYzMDBIMHoiLz48L3N2Zz4=')] opacity-[0.02] mix-blend-overlay z-10"></div>
              
              {/* Subtle scan line */}
              <div className="fixed top-0 left-0 w-full h-[1px] bg-[rgba(var(--mg-primary),0.4)] shadow-[0_0_8px_rgba(var(--mg-primary),0.3)] animate-scan-line z-20"></div>
              
              {/* Very subtle line noise */}
              <div className="fixed inset-0 overflow-hidden opacity-[0.01] z-10">
                <div className="absolute inset-0 line-noise"></div>
              </div>
            </div>
            
            <div className="relative z-20 flex flex-col flex-1">
              <Navigation />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
} 