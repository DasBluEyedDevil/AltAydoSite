import React from 'react';
import { auth0 } from "../lib/auth0";
import LandingPage from '../components/landing/LandingPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AydoCorp | Intergalactic Logistics & Transport',
  description: 'Excellence in shipping and resource consolidation across human and alien space. Based in the Ellis system on the planet Green.',
};

export default async function Home() {
  const session = await auth0.getSession();

  return (
    <main className="min-h-screen">
      <LandingPage isLoggedIn={!!session} />
    </main>
  );
} 