"use client";

import React, { Suspense } from 'react';
import HomeContent from '../components/HomeContent';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();
  // Show loading state while session is being determined
  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading home content...</div>;
  }
  return (
    <div className="container mx-auto px-4 py-12">
      <HomeContent isLoggedIn={!!session} userName={session?.user?.name || ''} />
    </div>
  );
}
