'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import ErrorBoundary from './ErrorBoundary';

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
  const [error, setError] = useState<string | null>(null);

  // Only generate random ID on the client side after initial render
  useEffect(() => {
    try {
      setRandomId(Math.random().toString(36).substring(2, 6).toUpperCase());
    } catch (e) {
      console.error("Error generating random ID:", e);
    }
  }, []);

  // Global error handling for auth issues
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error && event.error.message && 
          (event.error.message.includes('auth') || 
           event.error.message.includes('session') ||
           event.error.message.includes('secret'))) {
        console.error("Authentication error detected:", event.error);
        setError("Authentication system error. Please try again later.");
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center max-w-md mx-auto p-6 border border-gray-700 rounded-lg bg-gray-900">
          <h2 className="text-xl font-bold mb-4">Authentication Error</h2>
          <p className="mb-4 text-gray-400 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <SessionProvider session={null} refetchInterval={5}>
        <RandomIdContext.Provider value={{ randomId }}>
          {children}
        </RandomIdContext.Provider>
      </SessionProvider>
    </ErrorBoundary>
  );
} 