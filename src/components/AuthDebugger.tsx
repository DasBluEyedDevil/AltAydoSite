'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function AuthDebugger() {
  const { data: session, status, update } = useSession();
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  useEffect(() => {
    const debugData = {
      status,
      sessionExists: !!session,
      user: session?.user ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: (session.user as any).role,
        clearanceLevel: (session.user as any).clearanceLevel,
      } : null,
      timestamp: new Date().toISOString(),
    };
    
    setDebugInfo(JSON.stringify(debugData, null, 2));
  }, [session, status]);
  
  const handleManualSignOut = async () => {
    try {
      await signOut({ redirect: false });
      setDebugInfo(prev => prev + '\n\nSignOut called successfully');
    } catch (error) {
      setDebugInfo(prev => prev + '\n\nSignOut error: ' + JSON.stringify(error));
    }
  };
  
  const handleSessionRefresh = async () => {
    try {
      await update();
      setDebugInfo(prev => prev + '\n\nSession updated successfully');
    } catch (error) {
      setDebugInfo(prev => prev + '\n\nSession update error: ' + JSON.stringify(error));
    }
  };
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 right-0 p-4 bg-black/80 text-white text-xs z-50 max-w-md max-h-96 overflow-auto">
      <div className="font-mono">
        <h3 className="font-bold mb-2">Auth Debugger</h3>
        <pre className="whitespace-pre-wrap">{debugInfo}</pre>
        <div className="flex gap-2 mt-2">
          <button 
            onClick={handleManualSignOut}
            className="px-2 py-1 border border-gray-500 rounded hover:bg-gray-800"
          >
            Force Sign Out
          </button>
          <button 
            onClick={handleSessionRefresh}
            className="px-2 py-1 border border-gray-500 rounded hover:bg-gray-800"
          >
            Refresh Session
          </button>
        </div>
      </div>
    </div>
  );
} 