'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardWidgets from '../../components/dashboard/DashboardWidgets';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import EventCarousel from '../../components/dashboard/EventCarousel';
import EventsCalendar from '../../components/dashboard/EventsCalendar';
import Announcements from '../../components/dashboard/Announcements';
import { UserSession } from '../../lib/auth';
import Image from 'next/image';

export default function DashboardPage() {
  const { data: session, status } = useSession() as { data: UserSession | null, status: string };
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check authentication status
  useEffect(() => {
    // Wait for the session check to complete
    if (status === 'loading') {
      return;
    }
    
    // Session check completed
    setIsLoading(false);
    
    if (status === 'unauthenticated') {
      console.log("User is not authenticated, redirecting to login");
      router.push('/login');
    } else if (status === 'authenticated' && session) {
      console.log("User is authenticated:", session.user);
      setIsAuthenticated(true);
    }
  }, [status, router, session]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black bg-opacity-80 bg-[url('/images/spacebg.jpg')] bg-cover bg-center bg-blend-overlay">
        <div className="mg-loading-spinner">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 border border-[rgba(var(--mg-primary),0.2)] rounded-sm"></div>
              <div className="absolute inset-0 border-t-2 border-l-2 border-[rgba(var(--mg-primary),0.8)] rounded-sm animate-spin"></div>
            </div>
            <div className="mt-4 font-quantify tracking-wider text-xs">LOADING EMPLOYEE PORTAL</div>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated after checks, show auth required message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black bg-opacity-80 bg-[url('/images/spacebg.jpg')] bg-cover bg-center bg-blend-overlay">
        <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.4)] p-8 rounded-sm text-center max-w-md">
          <div className="text-[rgba(var(--mg-error),0.8)] mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="mg-title text-xl mb-2">AUTHENTICATION REQUIRED</h3>
          <p className="mg-subtitle text-[rgba(var(--mg-text),0.7)] mb-4">
            Your session is not valid. Please log in to access the Employee Portal.
          </p>
          <button 
            onClick={() => router.push('/login')}
            className="mg-button py-2 px-4 font-quantify tracking-wider text-sm"
          >
            GO TO LOGIN
          </button>
        </div>
      </div>
    );
  }

  // Get username from email or use default
  const getUserDisplayName = () => {
    if (!session?.user?.name && !session?.user?.email) return "Employee";
    return session.user.name || session.user.email?.split('@')[0] || "Employee";
  };

  return (
    <div className="min-h-screen bg-black bg-opacity-80 bg-[url('/images/spacebg.jpg')] bg-cover bg-center bg-blend-overlay">
      <div className="container mx-auto px-4 py-8 pt-16">
        {/* Header */}
        <motion.div 
          className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="mg-title text-3xl mb-1 text-[rgba(var(--mg-primary),0.9)]">EMPLOYEE PORTAL</h1>
            <div className="mg-subtitle text-sm tracking-wider">WELCOME BACK, {getUserDisplayName().toUpperCase()}</div>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center">
            <div className="h-10 w-10 relative mr-3">
              <Image 
                src="/images/Aydo_Corp_logo_employees.png" 
                alt="AydoCorp Employee Logo" 
                fill 
                className="object-contain"
              />
            </div>
            <div>
              <div className="text-xs text-[rgba(var(--mg-text),0.6)]">CLEARANCE LEVEL</div>
              <div className="text-sm font-quantify tracking-wider text-[rgba(var(--mg-primary),0.9)]">
                {session?.user?.clearanceLevel || 1}
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            className="lg:col-span-1 h-full"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <DashboardSidebar />
          </motion.div>
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Image Carousel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <EventCarousel />
            </motion.div>
            
            {/* Dashboard Widgets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="w-full mx-auto">
                <DashboardWidgets user={
                  session?.user ? {
                    name: session.user.name || undefined,
                    email: session.user.email || undefined,
                    picture: session.user.image || undefined,
                    clearanceLevel: session.user.clearanceLevel
                  } : undefined
                } />
              </div>
            </motion.div>
            
            {/* Events and Announcements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Events Calendar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="col-span-1"
              >
                <EventsCalendar />
              </motion.div>
              
              {/* Announcements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="col-span-1"
              >
                <Announcements />
              </motion.div>
            </div>
            
            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="mt-8 text-center text-xs text-[rgba(var(--mg-text),0.5)]"
            >
              <p>AYDO INTERGALACTIC CORPORATION</p>
              <p className="mt-1">EMPLOYEE ACCESS ONLY • CONFIDENTIAL</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 