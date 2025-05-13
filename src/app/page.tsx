import React, { Suspense } from 'react';
import HomeContent from '../components/HomeContent';
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';

export const metadata: Metadata = {
  title: 'AydoCorp | Intergalactic Logistics & Transport',
  description: 'Excellence in shipping and resource consolidation across human and alien space. Based in the Ellis system on the planet Green.',
};

export default async function Home() {
  const session = await getServerSession();

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading home content...</div>}>
      <div className="container mx-auto px-4 py-12">
        <HomeContent isLoggedIn={!!session} userName={session?.user?.name || ''} />
      </div>
    </Suspense>
  );
} 