'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import EventCarousel from '../../components/dashboard/EventCarousel';
 
import UpcomingEventsPanel from '../../components/dashboard/panels/UpcomingEventsPanel';
import DashboardFooter from '../../components/dashboard/DashboardFooter';
import LoadingScreen from '../../components/dashboard/LoadingScreen';
import AuthError from '../../components/dashboard/AuthError';
import { UserSession } from '../../lib/auth';
import Image from 'next/image';
import { bgUrl, cdn } from '@/lib/cdn';
 
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
    return <LoadingScreen />;
  }

  // If not authenticated after checks, show auth required message
  if (!isAuthenticated) {
    return <AuthError />;
  }

  // Get username from email or use default
  const getUserDisplayName = () => {
    if (!session?.user?.name && !session?.user?.email) return "Employee";
    return session.user.name || session.user.email?.split('@')[0] || "Employee";
  };

  // MobiGlas angles and shapes for UI elements
  const cornerAccent = (position: string) => {
    const classes = {
      'tl': 'top-0 left-0 border-t border-l',
      'tr': 'top-0 right-0 border-t border-r',
      'bl': 'bottom-0 left-0 border-b border-l',
      'br': 'bottom-0 right-0 border-b border-r',
    };
    return `absolute w-5 h-5 ${classes[position as keyof typeof classes]} border-[rgba(var(--mg-primary),0.6)]`;
  };

  // Animation variants for consistent animations
  const fadeInUpVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: custom * 0.1,
        ease: "easeOut"
      }
    })
  };

  const fadeInLeftVariants: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        delay: 0.1,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black bg-opacity-95 bg-cover bg-center bg-blend-overlay relative overflow-hidden" style={{ backgroundImage: bgUrl('/spacebg.jpg') }}>
      {/* Holographic grid background */}
      <div className="hex-grid absolute inset-0 opacity-5" />
      
      {/* Scan line effect */}
      <div className="animate-scanline absolute inset-0 h-full w-full opacity-5" />

      {/* MobiGlas outer frame - hide on small screens */}
      <div className="absolute inset-6 border border-[rgba(var(--mg-primary),0.3)] pointer-events-none z-10 hidden sm:block">
        <div className={cornerAccent('tl')}></div>
        <div className={cornerAccent('tr')}></div>
        <div className={cornerAccent('bl')}></div>
        <div className={cornerAccent('br')}></div>
      </div>
      
      {/* Header Bar */}
      <motion.header 
        className="relative z-20 px-4 sm:px-6 pt-4 sm:pt-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {/* Main Header with Logo and User Info */}
        <div className="relative bg-[rgba(var(--mg-panel-dark),0.8)] backdrop-blur-md border border-[rgba(var(--mg-primary),0.4)] rounded-sm mb-4 sm:mb-6 overflow-hidden">
          {/* Top edge glow */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.8)] to-transparent"></div>
          
          {/* Corner accents */}
          <div className={cornerAccent('tl')}></div>
          <div className={cornerAccent('tr')}></div>
          <div className={cornerAccent('bl')}></div>
          <div className={cornerAccent('br')}></div>
          
          {/* Holographic circuit pattern */}
          <div className="absolute inset-0 circuit-bg opacity-5"></div>
          
          <div className="p-3 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center">
            {/* Logo Section */}
            <motion.div 
              className="md:col-span-1 flex justify-center md:justify-start"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="relative h-14 w-14 sm:h-16 sm:w-16">
                <div className="absolute inset-0 rounded-full border border-[rgba(var(--mg-primary),0.5)] animate-pulse"></div>
                <div className="absolute inset-2 rounded-full border border-[rgba(var(--mg-primary),0.3)]"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image 
                    src={cdn('/Aydo_Corp_logo_employees.png')} 
                    alt="AydoCorp Logo" 
                    width={56}
                    height={56}
                    className="object-contain hologram-flicker"
                  />
                </div>
                {/* Orbiting dot */}
                <motion.div 
                  className="absolute h-1.5 w-1.5 rounded-full bg-[rgba(var(--mg-primary),0.9)]"
                  animate={{
                    rotate: 360
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    top: '50%',
                    left: '50%',
                    marginLeft: '32px',
                    marginTop: '-2px',
                    transformOrigin: '-32px 2px'
                  }}
                />
              </div>
            </motion.div>
            
            {/* Title and Welcome */}
            <motion.div 
              className="md:col-span-7 text-center md:text-left flex flex-col justify-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="relative inline-block">
                <h1 className="mg-title text-2xl sm:text-3xl md:text-4xl mb-1 text-[rgba(var(--mg-primary),0.9)] font-quantify tracking-widest mg-glow">
                  EMPLOYEE PORTAL
                </h1>
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-[rgba(var(--mg-primary),0.2)] hidden md:block">
                  <div className="absolute top-0 left-0 w-full h-full bg-[rgba(var(--mg-primary),0.8)] animate-pulse" style={{ height: '30%' }} />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center sm:space-x-2">
                <div className="text-sm tracking-wider text-[rgba(var(--mg-text),0.8)]">
                  WELCOME BACK, <span className="text-[rgba(var(--mg-accent),0.9)] font-quantify">{getUserDisplayName().toUpperCase()}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-[rgba(var(--mg-primary),0.8)] animate-pulse hidden sm:block"></div>
                <div className="text-xs text-[rgba(var(--mg-text),0.6)]">
                  LAST LOGIN: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
            
            {/* Clearance Level Badge */}
            <motion.div 
              className="md:col-span-4 flex justify-center md:justify-end mt-2 sm:mt-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative bg-[rgba(var(--mg-panel-dark),0.6)] backdrop-blur-sm py-2 sm:py-3 px-4 sm:px-6 border border-[rgba(var(--mg-primary),0.4)] rounded-sm">
                {/* Corner accents */}
                <div className={`${cornerAccent('tl')} w-3 h-3`}></div>
                <div className={`${cornerAccent('br')} w-3 h-3`}></div>
                
                <div className="flex items-center space-x-4">
                  {/* Clearance meter */}
                  <div className="hidden md:block">
                    <div className="relative h-16 w-3">
                      <div className="absolute inset-x-0 bottom-0 h-full bg-[rgba(var(--mg-primary),0.1)] rounded-sm"></div>
                      <motion.div 
                        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(var(--mg-primary),0.8)] to-[rgba(var(--mg-primary),0.3)] rounded-sm"
                        initial={{ height: '0%' }}
                        animate={{ 
                          height: `${(session?.user?.clearanceLevel || 1) * 20}%`,
                          maxHeight: '100%'
                        }}
                        transition={{ duration: 1, delay: 0.5 }}
                      ></motion.div>
                      {/* Level markers */}
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className="absolute w-full h-px bg-[rgba(var(--mg-text),0.3)]" 
                          style={{ bottom: `${i * 20}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-center md:text-left text-[rgba(var(--mg-text),0.6)]">CLEARANCE LEVEL</div>
                    <div className="flex items-center justify-center md:justify-start">
                      <div className="text-2xl sm:text-3xl font-quantify tracking-wider text-[rgba(var(--mg-primary),0.9)] mg-flicker mr-1">
                        {session?.user?.clearanceLevel || 1}
                      </div>
                      <div className="text-xs text-[rgba(var(--mg-warning),0.8)]">/ 5</div>
                    </div>
                    <div className="text-[9px] text-center md:text-left text-[rgba(var(--mg-text),0.5)]">AUTHORIZED PERSONNEL</div>
                  </div>
                </div>
                
                {/* Animation highlight */}
                <div className="absolute inset-0 border border-[rgba(var(--mg-primary),0.2)] rounded-sm mg-highlight"></div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* System status bar */}
        <div className="flex justify-between items-center py-2 px-3 sm:px-4 bg-[rgba(var(--mg-panel-dark),0.5)] border-t border-b border-[rgba(var(--mg-primary),0.2)] mb-4 sm:mb-6 text-xs sm:text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-[rgba(var(--mg-success),0.8)] mr-2 animate-pulse"></div>
              <span className="text-xs text-[rgba(var(--mg-text),0.7)]">SYSTEM ONLINE</span>
            </div>
            <div className="hidden md:flex items-center">
              <div className="w-2 h-2 rounded-full bg-[rgba(var(--mg-primary),0.8)] mr-2"></div>
              <span className="text-xs text-[rgba(var(--mg-text),0.7)]">SECURE CONNECTION</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-xs text-[rgba(var(--mg-text),0.7)]">
              {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            <div className="text-xs font-mono text-[rgba(var(--mg-primary),0.8)] mg-flicker">
              {new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false
              })}
            </div>
          </div>
        </div>
      </motion.header>
      
      {/* Main Dashboard Container */}
      <div className="flex-grow relative z-10 px-4 sm:px-6 pb-4 sm:pb-6 overflow-hidden">
        <div className="flex flex-col h-full space-y-4 sm:space-y-6">
          {/* Main Dashboard Layout - with angled borders and glowing edges */}
          <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Navigation Panel - Sidebar */}
            <motion.div
              className="lg:col-span-3 xl:col-span-2 relative"
              variants={fadeInLeftVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Panel container with angled corners */}
              <div className="relative bg-[rgba(var(--mg-panel-dark),0.7)] backdrop-blur-md border border-[rgba(var(--mg-primary),0.3)] h-full rounded-sm overflow-hidden">
                {/* Corner accents */}
                <div className={cornerAccent('tl')}></div>
                <div className={cornerAccent('br')}></div>
                
                {/* Top border glow */}
                <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.6)] to-transparent"></div>
                
                {/* Vertical highlight */}
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-[rgba(var(--mg-primary),0.2)]"></div>
                
                {/* Dashboard sidebar component */}
                <div className="h-full">
                  <DashboardSidebar />
                </div>
              </div>
            </motion.div>
            
            {/* Main Content Area */}
            <div className="lg:col-span-9 xl:col-span-10 flex flex-col space-y-4 sm:space-y-6">
              {/* Image Carousel - with angled design */}
              <motion.div
                className="relative"
                variants={fadeInUpVariants}
                initial="hidden"
                animate="visible"
                custom={0}
              >
                <div className="relative bg-[rgba(var(--mg-panel-dark),0.7)] backdrop-blur-md border border-[rgba(var(--mg-primary),0.3)] rounded-sm overflow-hidden">
                  {/* Corner accents */}
                  <div className={cornerAccent('tl')}></div>
                  <div className={cornerAccent('tr')}></div>
                  <div className={cornerAccent('bl')}></div>
                  <div className={cornerAccent('br')}></div>
                  
                  {/* Top edge glow */}
                  <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.5)] to-transparent"></div>
                  
                  <EventCarousel />
                </div>
              </motion.div>
              
              {/* Main Dashboard Content Area */}
              <div className="flex-grow grid grid-cols-1 gap-4 sm:gap-6">
                
                {/* MobiGlas Panels Grid - only Upcoming Events retained */}
                <motion.div
                  variants={fadeInUpVariants}
                  initial="hidden"
                  animate="visible"
                  custom={2}
                >
                  <div className="grid grid-cols-1">
                    <div className="w-full">
                      <UpcomingEventsPanel />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* New Minimalist Footer */}
      <DashboardFooter />
      
      {/* Floating holographic elements - purely decorative */}
      <div className="absolute bottom-20 right-20 w-32 h-32 pointer-events-none opacity-20 animate-spin-slow hidden md:block">
        <div className="absolute inset-0 border border-[rgba(var(--mg-primary),0.3)] rounded-full"></div>
        <div className="absolute inset-4 border border-[rgba(var(--mg-primary),0.2)] rounded-full"></div>
        <div className="absolute inset-8 border border-[rgba(var(--mg-primary),0.1)] rounded-full"></div>
      </div>
      
      <div className="absolute top-40 left-20 w-24 h-24 pointer-events-none opacity-10 animate-float-slow hidden md:block">
        <div className="absolute inset-0 border border-[rgba(var(--mg-accent),0.3)] rotate-45"></div>
        <div className="absolute inset-0 border border-[rgba(var(--mg-accent),0.1)] rotate-[30deg]"></div>
      </div>
    </div>
  );
} 
