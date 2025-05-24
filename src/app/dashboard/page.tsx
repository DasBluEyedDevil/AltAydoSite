'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [bootupPhase, setBootupPhase] = useState(0);

  // MobiGlas bootup sequence
  useEffect(() => {
    if (status !== 'loading' && bootupPhase < 3) {
      const bootupTimer = setTimeout(() => {
        setBootupPhase(prev => prev + 1);
      }, 800);

      return () => clearTimeout(bootupTimer);
    }
  }, [bootupPhase, status]);

  // Check authentication status
  useEffect(() => {
    // Wait for the session check to complete
    if (status === 'loading') {
      return;
    }

    // Add a small delay to ensure session is fully established
    // This helps prevent authentication loops due to race conditions
    const timer = setTimeout(() => {
      console.log("Dashboard auth check - status:", status, "session exists:", !!session, 
        "user:", session?.user?.name, "clearance:", session?.user?.clearanceLevel);

      // Session check completed
      setIsLoading(false);

      if (status === 'unauthenticated' || !session || !session.user) {
        console.log("User is not authenticated or session is invalid, redirecting to login");

        // Clear any stale session data by forcing a hard reload of the login page
        // This ensures we don't get stuck in a loop with invalid session data
        window.location.href = '/login?reset=true';
      } else if (status === 'authenticated' && session && session.user) {
        console.log("User is authenticated with valid session data:", session.user);
        setIsAuthenticated(true);

        // Store authentication timestamp in localStorage to help debug potential issues
        localStorage.setItem('last_auth_time', new Date().toISOString());
        localStorage.setItem('last_auth_user', session.user.name || 'unknown');
      }
    }, 800); // 800ms delay to ensure session is fully established

    // Clean up timer on unmount
    return () => clearTimeout(timer);
  }, [status, router, session]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black bg-opacity-90 bg-[url('/images/spacebg.jpg')] bg-cover bg-center bg-blend-overlay">
        <div className="relative w-full max-w-2xl">
          {/* Holographic overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(var(--mg-glow),0.05)] to-transparent opacity-50 pointer-events-none"></div>
          <div className="absolute inset-0 bg-[url('/images/grid-pattern.png')] bg-repeat opacity-10 pointer-events-none"></div>

          <motion.div 
            className="flex flex-col items-center justify-center p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* MobiGlas Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <div className="relative h-24 w-24 mb-2">
                <Image 
                  src="/images/Aydo_Corp_logo_employees.png" 
                  alt="AydoCorp Logo" 
                  fill 
                  className="object-contain"
                />
                <div className="absolute inset-0 animate-pulse bg-[rgba(var(--mg-glow),0.2)] rounded-full blur-xl"></div>
              </div>
              <div className="text-center font-quantify text-[rgba(var(--mg-primary),0.9)] text-xl tracking-widest">
                MOBIGLAS
              </div>
              <div className="text-center text-[rgba(var(--mg-text),0.6)] text-xs">
                AYDO CORPORATION EDITION
              </div>
            </motion.div>

            {/* Loading Animation */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Outer rotating ring */}
              <motion.div 
                className="absolute w-full h-full border-2 border-[rgba(var(--mg-primary),0.2)] rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute top-0 left-1/2 w-3 h-3 -ml-1.5 -mt-1.5 bg-[rgba(var(--mg-primary),0.8)] rounded-full"></div>
              </motion.div>

              {/* Middle rotating ring */}
              <motion.div 
                className="absolute w-3/4 h-3/4 border border-[rgba(var(--mg-accent),0.3)] rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute bottom-0 left-1/2 w-2 h-2 -ml-1 -mb-1 bg-[rgba(var(--mg-accent),0.8)] rounded-full"></div>
              </motion.div>

              {/* Inner rotating ring */}
              <motion.div 
                className="absolute w-1/2 h-1/2 border border-[rgba(var(--mg-warning),0.3)] rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute right-0 top-1/2 w-2 h-2 -mr-1 -mt-1 bg-[rgba(var(--mg-warning),0.8)] rounded-full"></div>
              </motion.div>

              {/* Center element */}
              <div className="relative z-10 text-center">
                <motion.div 
                  className="w-16 h-16 mx-auto mb-2 border border-[rgba(var(--mg-primary),0.4)] rounded-full flex items-center justify-center"
                  animate={{ 
                    boxShadow: [
                      '0 0 0 rgba(var(--mg-glow), 0)',
                      '0 0 20px rgba(var(--mg-glow), 0.5)',
                      '0 0 0 rgba(var(--mg-glow), 0)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.div 
                    className="w-12 h-12 border border-[rgba(var(--mg-primary),0.6)] rounded-full flex items-center justify-center"
                    animate={{ scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <motion.div 
                      className="w-8 h-8 bg-[rgba(var(--mg-primary),0.2)] rounded-full flex items-center justify-center"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="text-[rgba(var(--mg-primary),1)] font-bold">
                        {Math.floor(bootupPhase * 33)}%
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
                <div className="font-quantify tracking-wider text-sm text-[rgba(var(--mg-primary),0.9)]">
                  INITIALIZING MOBIGLAS
                </div>
                <div className="mt-2 text-xs text-[rgba(var(--mg-text),0.7)]">
                  {bootupPhase === 0 && "ESTABLISHING SECURE CONNECTION..."}
                  {bootupPhase === 1 && "VERIFYING CREDENTIALS..."}
                  {bootupPhase === 2 && "LOADING EMPLOYEE INTERFACE..."}
                  {bootupPhase === 3 && "READY"}
                </div>
              </div>
            </div>

            {/* System status indicators */}
            <div className="mt-8 w-full max-w-md">
              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <div className="text-[rgba(var(--mg-text),0.6)]">SYSTEM</div>
                  <div className="text-[rgba(var(--mg-success),0.9)]">ONLINE</div>
                </div>
                <div>
                  <div className="text-[rgba(var(--mg-text),0.6)]">SECURITY</div>
                  <div className="text-[rgba(var(--mg-primary),0.9)]">SCANNING</div>
                </div>
                <div>
                  <div className="text-[rgba(var(--mg-text),0.6)]">NETWORK</div>
                  <div className="text-[rgba(var(--mg-success),0.9)]">CONNECTED</div>
                </div>
              </div>

              <div className="mt-6 text-center text-[rgba(var(--mg-text),0.5)] text-xs">
                <p>AYDO INTERGALACTIC CORPORATION</p>
                <p className="mt-1">MOBIGLAS SYSTEM v3.42.7</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // If not authenticated after checks, show auth required message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black bg-opacity-90 bg-[url('/images/spacebg.jpg')] bg-cover bg-center bg-blend-overlay">
        <div className="relative w-full max-w-md">
          {/* Holographic overlay effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(var(--mg-glow),0.05)] to-transparent opacity-50 pointer-events-none"></div>
          <div className="absolute inset-0 bg-[url('/images/grid-pattern.png')] bg-repeat opacity-10 pointer-events-none"></div>

          <motion.div 
            className="relative z-10 bg-[rgba(var(--mg-panel-dark),0.7)] backdrop-blur-md border border-[rgba(var(--mg-danger),0.3)] p-8 rounded-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Top border glow */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(var(--mg-danger),0.5)] to-transparent"></div>

            {/* Warning icon with pulsing effect */}
            <motion.div 
              className="text-[rgba(var(--mg-danger),0.8)] mb-6 relative"
              animate={{ 
                boxShadow: [
                  '0 0 0 rgba(var(--mg-danger), 0)',
                  '0 0 20px rgba(var(--mg-danger), 0.3)',
                  '0 0 0 rgba(var(--mg-danger), 0)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="absolute inset-0 bg-[rgba(var(--mg-danger),0.1)] rounded-full blur-xl"></div>
              </div>
            </motion.div>

            {/* Alert text */}
            <div className="text-center">
              <h3 className="font-quantify text-xl mb-2 text-[rgba(var(--mg-danger),0.9)] tracking-wider">AUTHENTICATION FAILURE</h3>
              <div className="h-[1px] w-3/4 mx-auto bg-gradient-to-r from-transparent via-[rgba(var(--mg-danger),0.3)] to-transparent mb-4"></div>
              <p className="text-[rgba(var(--mg-text),0.8)] mb-6 text-sm">
                Your session is not valid or has expired. Please authenticate to access the MobiGlas Employee Portal.
              </p>

              {/* Status indicators */}
              <div className="grid grid-cols-2 gap-2 mb-6 text-xs">
                <div className="bg-[rgba(var(--mg-panel-dark),0.5)] p-2 rounded-sm">
                  <div className="text-[rgba(var(--mg-text),0.6)]">SESSION STATUS</div>
                  <div className="text-[rgba(var(--mg-danger),0.9)]">INVALID</div>
                </div>
                <div className="bg-[rgba(var(--mg-panel-dark),0.5)] p-2 rounded-sm">
                  <div className="text-[rgba(var(--mg-text),0.6)]">SECURITY LEVEL</div>
                  <div className="text-[rgba(var(--mg-warning),0.9)]">LOCKED</div>
                </div>
              </div>

              {/* Login button with hover effect */}
              <motion.button 
                onClick={() => router.replace('/login')}
                className="relative overflow-hidden group w-full py-3 px-4 bg-[rgba(var(--mg-panel-dark),0.7)] border border-[rgba(var(--mg-primary),0.3)] rounded-sm font-quantify tracking-wider text-sm text-[rgba(var(--mg-primary),0.9)]"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative z-10">AUTHENTICATE</div>
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-[rgba(var(--mg-primary),0.1)] to-[rgba(var(--mg-primary),0.2)]"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-[rgba(var(--mg-text),0.5)] text-xs">
              <p>AYDO INTERGALACTIC CORPORATION</p>
              <p className="mt-1">SECURITY PROTOCOL ACTIVE</p>
            </div>
          </motion.div>
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
    <div className="min-h-screen bg-black bg-opacity-90 bg-[url('/images/spacebg.jpg')] bg-cover bg-center bg-blend-overlay">
      {/* Holographic overlay effects */}
      <div className="fixed inset-0 bg-[url('/images/grid-pattern.png')] bg-repeat opacity-5 pointer-events-none"></div>
      <div className="fixed inset-0 bg-gradient-to-b from-[rgba(var(--mg-glow),0.03)] to-transparent opacity-70 pointer-events-none"></div>

      <div className="container mx-auto px-4 py-8 pt-16 relative z-10">
        {/* Header with holographic effect */}
        <motion.div 
          className="mb-8 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-[rgba(var(--mg-panel-dark),0.3)] backdrop-blur-sm rounded-sm -z-10"></div>
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.5)] to-transparent"></div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4">
            <div className="flex items-center">
              <motion.div 
                className="h-12 w-12 relative mr-4"
                animate={{ 
                  boxShadow: [
                    '0 0 0 rgba(var(--mg-glow), 0)',
                    '0 0 10px rgba(var(--mg-glow), 0.3)',
                    '0 0 0 rgba(var(--mg-glow), 0)'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Image 
                  src="/images/Aydo_Corp_logo_employees.png" 
                  alt="AydoCorp Logo" 
                  fill 
                  className="object-contain"
                />
              </motion.div>

              <div>
                <h1 className="font-quantify text-2xl md:text-3xl text-[rgba(var(--mg-primary),0.9)] tracking-wider">MOBIGLAS</h1>
                <div className="flex items-center">
                  <div className="h-1 w-1 rounded-full bg-[rgba(var(--mg-success),0.8)] mr-2"></div>
                  <div className="text-sm tracking-wider text-[rgba(var(--mg-text),0.8)]">
                    EMPLOYEE PORTAL
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-0 flex items-center bg-[rgba(var(--mg-panel-dark),0.5)] p-2 rounded-sm">
              <div className="mr-3">
                <div className="text-xs text-[rgba(var(--mg-text),0.6)]">USER</div>
                <div className="text-sm font-quantify tracking-wider text-[rgba(var(--mg-primary),0.9)]">
                  {getUserDisplayName().toUpperCase()}
                </div>
              </div>

              <div className="h-10 w-[1px] bg-gradient-to-b from-transparent via-[rgba(var(--mg-primary),0.2)] to-transparent mx-2"></div>

              <div>
                <div className="text-xs text-[rgba(var(--mg-text),0.6)]">CLEARANCE</div>
                <div className="text-sm font-quantify tracking-wider text-[rgba(var(--mg-primary),0.9)]">
                  LEVEL {session?.user?.clearanceLevel || 1}
                </div>
              </div>

              <motion.div 
                className="ml-3 h-10 w-10 rounded-full bg-[rgba(var(--mg-panel-dark),0.7)] border border-[rgba(var(--mg-primary),0.3)] flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[rgba(var(--mg-primary),0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </motion.div>
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
              className="mt-8 text-center"
            >
              <div className="h-[1px] w-1/2 mx-auto bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.2)] to-transparent mb-4"></div>
              <div className="text-xs text-[rgba(var(--mg-text),0.5)]">
                <p>AYDO INTERGALACTIC CORPORATION</p>
                <p className="mt-1">EMPLOYEE ACCESS ONLY • CONFIDENTIAL</p>
                <p className="mt-1 text-[rgba(var(--mg-primary),0.6)]">MOBIGLAS v3.42.7</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 
