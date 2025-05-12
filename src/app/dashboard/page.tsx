'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardWidgets from '../../components/dashboard/DashboardWidgets';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import EventCarousel from '../../components/dashboard/EventCarousel';
import EventsCalendar from '../../components/dashboard/EventsCalendar';
import Announcements from '../../components/dashboard/Announcements';
import { UserSession } from '../../lib/auth';

export default function DashboardPage() {
  const { data: session, status } = useSession() as { data: UserSession | null, status: string };
  const router = useRouter();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="mg-loading-spinner">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 border border-[rgba(var(--mg-primary),0.2)] rounded-sm"></div>
              <div className="absolute inset-0 border-t-2 border-l-2 border-[rgba(var(--mg-primary),0.8)] rounded-sm animate-spin"></div>
            </div>
            <div className="mt-4 font-quantify tracking-wider text-xs">LOADING DASHBOARD</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-12">
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mg-title text-2xl mb-1">Command Center</h1>
        <div className="mg-subtitle text-xs tracking-wider">SYSTEM ACCESS GRANTED</div>
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
          {/* Dashboard Welcome and User Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
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
          
          {/* Image Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <EventCarousel />
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
        </div>
      </div>
    </div>
  );
} 