'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import SecureConnectionIndicator from '../../components/SecureConnectionIndicator';

export default function DashboardClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen relative">
      {/* Main content without top padding */}
      <main>
        {children}
      </main>
    </div>
  );
} 