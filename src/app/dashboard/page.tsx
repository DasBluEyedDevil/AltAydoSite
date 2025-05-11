import React from 'react';
import { auth0 } from "../../lib/auth0";
import DashboardWidgets from '../../components/dashboard/DashboardWidgets';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AydoCorp | Command Center',
  description: 'Access your AydoCorp organization dashboard and resources.'
};

export default async function Dashboard() {
  const session = await auth0.getSession();
  
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center p-8 border border-[rgba(var(--mg-primary),0.3)] backdrop-blur-sm bg-black/30 rounded">
          <h2 className="text-xl text-[rgba(var(--mg-primary),1)]">Access Restricted</h2>
          <p className="opacity-70 mt-2">Please log in to view your dashboard</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative min-h-[100vh] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,20,40,0.9)] to-[rgba(0,10,20,0.95)] z-0"></div>
      <div className="absolute inset-0 hexagon-bg opacity-10 pointer-events-none z-0"></div>
      <div className="absolute inset-0 mg-grid-bg z-0"></div>
      
      {/* Space background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <Image
          src="/images/spacebg.jpg"
          alt="Space Background"
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      
      {/* Organization Header */}
      <div className="relative z-10 pt-8 mb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="text-center">
            <h1 className="text-2xl font-light text-[rgba(var(--mg-primary),1)] font-['Quantify'] tracking-wider">COMMAND CENTER</h1>
            <div className="w-40 h-1 mx-auto my-2 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.5)] to-transparent"></div>
          </div>
        </div>
      </div>
      
      {/* Dashboard Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="mg-container p-6 backdrop-blur-md">
          <DashboardWidgets user={session.user} />
        </div>
      </div>
      
      {/* Footer */}
      <div className="relative z-10 mt-6 pb-4 text-center text-xs text-gray-500">
        <div className="w-40 h-1 mx-auto mb-2 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.2)] to-transparent"></div>
        © AydoCorp • Ellis System • Planet Green
      </div>
    </div>
  );
} 