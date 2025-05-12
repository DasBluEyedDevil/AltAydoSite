'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  
  return (
    <>
      {/* Optional Auth Status Bar - fixed at the very top */}
      <div className="fixed top-0 left-0 right-0 bg-[rgba(var(--mg-panel-dark),0.8)] border-b border-[rgba(var(--mg-primary),0.2)] py-1 px-4 relative z-50">
        <div className="max-w-7xl mx-auto flex justify-end items-center text-xs">
          {status === 'authenticated' ? (
            <div className="flex items-center space-x-4">
              <span className="text-[rgba(var(--mg-text),0.7)]">
                Welcome, <Link href="/userprofile" className="text-[rgba(var(--mg-primary),0.9)] hover:text-[rgba(var(--mg-primary),1)] transition-colors">{session.user?.name}</Link>
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="hover:text-[rgba(var(--mg-primary),0.9)] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="hover:text-[rgba(var(--mg-primary),0.9)] transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="font-quantify tracking-wider">PILOT LOGIN</span>
            </Link>
          )}
        </div>
      </div>
      
      {/* Add a spacer to push down content below the auth bar */}
      <div className="h-6 md:h-6"></div>
      
      {children}
    </>
  );
} 