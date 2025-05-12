'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';

// Create a context for storing random IDs consistently
export const RandomIdContext = createContext<{ randomId: string }>({
  randomId: 'XXXX',
});

export const useRandomId = () => useContext(RandomIdContext);

export default function UserProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [randomId, setRandomId] = useState('XXXX');

  // Only generate random ID on the client side after initial render
  useEffect(() => {
    setRandomId(Math.random().toString(36).substring(2, 6).toUpperCase());
  }, []);

  return (
    <SessionProvider session={null} refetchInterval={5}>
      <RandomIdContext.Provider value={{ randomId }}>
        {children}
      </RandomIdContext.Provider>
    </SessionProvider>
  );
} 