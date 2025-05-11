'use client';

import { useUser } from '@auth0/nextjs-auth0';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Profile() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return (
    <div className="fixed top-4 right-4 z-50">
      <div className="mg-container p-2">
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[rgba(var(--mg-primary),0.6)] animate-pulse"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-[rgba(var(--mg-primary),0.6)] animate-pulse delay-100"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-[rgba(var(--mg-primary),0.6)] animate-pulse delay-200"></div>
        </div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="fixed top-4 right-4 z-50">
      <div className="mg-container p-2">
        <div className="text-[rgba(var(--mg-danger),0.8)] text-xs">ERR</div>
      </div>
    </div>
  );
  
  if (!user) {
    return null; // Navigation component handles login button when not logged in
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <motion.div 
        className="relative mg-container p-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ boxShadow: '0 0 10px rgba(var(--mg-primary), 0.2)' }}
      >
        <div className="flex items-center space-x-2">
          {user.picture && (
            <div className="relative w-8 h-8 overflow-hidden">
              <img
                src={user.picture}
                alt={user.name || 'Profile'}
                className="rounded-sm w-8 h-8 border border-[rgba(var(--mg-primary),0.3)]"
              />
              <div className="absolute inset-0 radar-sweep opacity-10"></div>
            </div>
          )}
          <div className="text-left text-xs">
            <div className="flex items-center">
              <div className="mg-subtitle text-xs tracking-wider">
                {(user.name || '').toUpperCase()}
              </div>
              <div className="ml-1.5 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[rgba(var(--mg-success),0.8)] animate-pulse mr-1"></span>
                <span className="text-[rgba(var(--mg-success),0.8)] text-[10px] tracking-wide">ACTIVE</span>
              </div>
            </div>
            {user.email && (
              <div className="text-[rgba(var(--mg-text),0.5)] text-[10px] tracking-wide font-light">
                {user.email.toUpperCase()}
              </div>
            )}
          </div>
          <Link 
            href="/api/auth/logout"
            className="ml-1 text-[rgba(var(--mg-text),0.4)] hover:text-[rgba(var(--mg-primary),0.8)] transition-colors duration-200"
            title="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </Link>
        </div>
      </motion.div>
    </div>
  );
} 