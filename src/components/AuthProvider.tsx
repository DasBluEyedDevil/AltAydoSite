'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider refetchInterval={60 * 5}>{children}</SessionProvider>;
} 