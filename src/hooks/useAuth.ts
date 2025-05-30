'use client';

import { useSession } from 'next-auth/react';

export const useAuth = () => {
  const { data: session, status, update } = useSession();
  
  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    user: session?.user,
    update,
  };
}; 