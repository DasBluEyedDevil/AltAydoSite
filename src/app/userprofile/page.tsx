'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function UserProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    aydoHandle: '',
    discordName: '',
    rsiAccountName: ''
  });
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/userprofile');
    }
  }, [status, router]);

  // Update local state when session data is available
  useEffect(() => {
    if (session?.user) {
      setUserData({
        name: session.user.name || '',
        email: session.user.email || '',
        aydoHandle: session.user.aydoHandle || '',
        discordName: session.user.discordName || '',
        rsiAccountName: session.user.rsiAccountName || ''
      });
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="mg-loading-spinner">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 border border-[rgba(var(--mg-primary),0.2)] rounded-sm"></div>
              <div className="absolute inset-0 border-t-2 border-l-2 border-[rgba(var(--mg-primary),0.8)] rounded-sm animate-spin"></div>
            </div>
            <div className="mt-4 font-quantify tracking-wider text-xs">LOADING PROFILE</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-12">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mg-title text-2xl mb-1">Employee Profile</h1>
        <div className="mg-subtitle text-xs tracking-wider">PERSONAL DATA MANAGEMENT</div>
      </motion.div>
      
      <div className="max-w-3xl mx-auto">
        {/* User Profile */}
        <motion.div
          className="mg-panel bg-[rgba(var(--mg-panel),0.8)] backdrop-blur-md p-6 rounded-sm relative mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-5 h-5 border-l border-t border-[rgba(var(--mg-primary),0.5)]"></div>
          <div className="absolute top-0 right-0 w-5 h-5 border-r border-t border-[rgba(var(--mg-primary),0.5)]"></div>
          <div className="absolute bottom-0 left-0 w-5 h-5 border-l border-b border-[rgba(var(--mg-primary),0.5)]"></div>
          <div className="absolute bottom-0 right-0 w-5 h-5 border-r border-b border-[rgba(var(--mg-primary),0.5)]"></div>

          <h2 className="mg-subtitle text-lg mb-4 tracking-wider">ACCOUNT INFORMATION</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="mg-subtitle text-xs mb-1 block tracking-wider">AYDOCORP HANDLE</label>
                <div className="mg-value py-2 px-3 bg-[rgba(var(--mg-panel-dark),0.4)] rounded-sm">
                  {userData.aydoHandle}
                </div>
              </div>

              <div className="mb-4">
                <label className="mg-subtitle text-xs mb-1 block tracking-wider">EMAIL ADDRESS</label>
                <div className="mg-value py-2 px-3 bg-[rgba(var(--mg-panel-dark),0.4)] rounded-sm">
                  {userData.email}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <label className="mg-subtitle text-xs mb-1 block tracking-wider">DISCORD NAME</label>
                <div className="mg-value py-2 px-3 bg-[rgba(var(--mg-panel-dark),0.4)] rounded-sm">
                  {userData.discordName || 'Not set'}
                </div>
              </div>

              <div className="mb-4">
                <label className="mg-subtitle text-xs mb-1 block tracking-wider">RSI ACCOUNT</label>
                <div className="mg-value py-2 px-3 bg-[rgba(var(--mg-panel-dark),0.4)] rounded-sm">
                  {userData.rsiAccountName || 'Not set'}
                </div>
              </div>
            </div>
          </div>

          {session?.user.role === 'admin' && (
            <div className="mt-6 pt-6 border-t border-[rgba(var(--mg-primary),0.2)]">
              <div className="mg-subtitle text-xs mb-2 tracking-wider text-[rgba(var(--mg-warning),0.8)]">ADMIN ACCESS</div>
              <p className="text-sm text-[rgba(var(--mg-text),0.7)]">You have administrative privileges. Access the admin dashboard for system management.</p>
              <div className="mt-3">
                <button 
                  onClick={() => router.push('/admin')}
                  className="mg-button px-4 py-2 text-xs tracking-wider hover:bg-[rgba(var(--mg-primary),0.1)]"
                >
                  ADMIN DASHBOARD
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 