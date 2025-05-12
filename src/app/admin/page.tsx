import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';

export const metadata: Metadata = {
  title: 'AydoCorp | Admin Dashboard',
  description: 'Administrative controls for AydoCorp organization management.'
};

export default async function AdminDashboard() {
  const session = await getServerSession();
  
  // Check if user is logged in
  if (!session) {
    redirect('/login');
  }
  
  // TODO: Implement proper role check via NextAuth when integrated
  // For now, we'll use a placeholder check
  const isAdmin = session.user?.email === "shatteredobsidian@yahoo.com";
  
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center p-8 border border-[rgba(var(--mg-primary),0.3)] backdrop-blur-sm bg-black/30 rounded">
          <h2 className="text-xl text-[rgba(var(--mg-primary),1)]">Access Restricted</h2>
          <p className="opacity-70 mt-2">You do not have permission to access the admin dashboard</p>
          <Link href="/dashboard" className="mt-4 inline-block px-4 py-2 bg-[rgba(var(--mg-primary),0.2)] hover:bg-[rgba(var(--mg-primary),0.3)] text-[rgba(var(--mg-primary),0.9)] rounded transition-colors">
            Return to Command Center
          </Link>
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
            <h1 className="text-2xl font-light text-[rgba(var(--mg-primary),1)] font-['Quantify'] tracking-wider">ADMIN CONSOLE</h1>
            <div className="w-40 h-1 mx-auto my-2 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.5)] to-transparent"></div>
          </div>
        </div>
      </div>
      
      {/* Admin Dashboard Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="mg-container p-6 backdrop-blur-md">
          {/* Top Controls with Logo */}
          <div className="relative mb-5">
            {/* Centered Logo - Positioned absolutely to break from parent height constraints */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 mt-1.5">
              <img 
                src="/images/Aydo_Corp_3x3k_RSI.png" 
                alt="AydoCorp" 
                className="h-48 object-contain"
                style={{ filter: 'drop-shadow(0 0 14px rgba(0, 180, 230, 0.8))' }} 
              />
            </div>
            
            {/* Admin controls container - reduced height */}
            <div className="flex justify-between items-center py-1">
              <div className="text-base text-[rgba(var(--mg-primary),1)]">Administrator Console</div>

              {/* Empty div for centering - to ensure logo stays centered */}
              <div className="flex-grow"></div>
              
              <Link href="/dashboard" className="px-3 py-1.5 bg-[rgba(var(--mg-primary),0.2)] hover:bg-[rgba(var(--mg-primary),0.3)] text-[rgba(var(--mg-primary),0.9)] rounded transition-colors text-xs">
                Return to Command Center
              </Link>
            </div>
          </div>
          
          {/* Admin Section */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* User Management */}
            <div className="border border-[rgba(var(--mg-primary),0.3)] bg-black/30 rounded p-4">
              <div className="text-lg text-[rgba(var(--mg-primary),1)] mb-3 font-['Quantify']">User Management</div>
              <div className="text-sm text-gray-400 mb-4">Manage user roles, clearance levels, and organization assignments</div>
              <div className="flex justify-center">
                <button className="px-4 py-2 bg-[rgba(var(--mg-primary),0.2)] hover:bg-[rgba(var(--mg-primary),0.3)] text-[rgba(var(--mg-primary),0.9)] rounded transition-colors">
                  Configure Users
                </button>
              </div>
            </div>
            
            {/* Clearance Levels */}
            <div className="border border-[rgba(var(--mg-primary),0.3)] bg-black/30 rounded p-4">
              <div className="text-lg text-[rgba(var(--mg-primary),1)] mb-3 font-['Quantify']">Clearance Levels</div>
              <div className="text-sm text-gray-400 mb-4">Define security clearance levels and access permissions</div>
              <div className="flex justify-center">
                <button className="px-4 py-2 bg-[rgba(var(--mg-primary),0.2)] hover:bg-[rgba(var(--mg-primary),0.3)] text-[rgba(var(--mg-primary),0.9)] rounded transition-colors">
                  Manage Clearances
                </button>
              </div>
            </div>
            
            {/* Organization Structure */}
            <div className="border border-[rgba(var(--mg-primary),0.3)] bg-black/30 rounded p-4">
              <div className="text-lg text-[rgba(var(--mg-primary),1)] mb-3 font-['Quantify']">Organization Structure</div>
              <div className="text-sm text-gray-400 mb-4">Configure departments, divisions, and organizational units</div>
              <div className="flex justify-center">
                <button className="px-4 py-2 bg-[rgba(var(--mg-primary),0.2)] hover:bg-[rgba(var(--mg-primary),0.3)] text-[rgba(var(--mg-primary),0.9)] rounded transition-colors">
                  Edit Structure
                </button>
              </div>
            </div>
          </div>
          
          {/* Placeholder for more functionality */}
          <div className="border border-[rgba(var(--mg-primary),0.3)] bg-black/30 rounded p-6 text-center">
            <div className="text-lg text-[rgba(var(--mg-primary),1)] mb-3">Admin Dashboard Under Development</div>
            <div className="text-sm text-gray-400 mb-4">
              This page will be expanded to include full admin functionality, including:<br/>
              • User role management<br/>
              • Clearance level configuration<br/>
              • Organization structure customization<br/>
              • Content management
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="relative z-10 mt-6 pb-4 text-center text-xs text-gray-500">
        <div className="w-40 h-1 mx-auto mb-2 bg-gradient-to-r from-transparent via-[rgba(var(--mg-primary),0.2)] to-transparent"></div>
        © AydoCorp • Administrator Access • Security Level Alpha
      </div>
    </div>
  );
} 