'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider 
      refetchInterval={60 * 5} 
      refetchOnWindowFocus={true}
      basePath="/api/auth"
    >
      {children}
    </SessionProvider>
  );
} 
