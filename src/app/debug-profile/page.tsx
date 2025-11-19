'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { useSession } from 'next-auth/react';
import UserProfilePanel from '../../components/UserProfilePanel';
import Link from 'next/link';

export default function DebugUserProfilePage() {
  // Block access in production
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const { data: session, status } = useSession();
  const [showDebugInfo, setShowDebugInfo] = useState(true);
  const [storageItems, setStorageItems] = useState<{key: string, value: string}[]>([]);
  
  // Safely access localStorage on the client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const items = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key) || '';
          items.push({ key, value });
        }
      }
      setStorageItems(items);
    }
  }, []);
  
  return (
    <div className="min-h-screen relative bg-[rgba(var(--mg-bg),1)] p-0 md:p-6">
      {/* Debugging Toolbar */}
      <div className="fixed top-0 left-0 w-full bg-[rgba(0,0,0,0.8)] p-3 z-50 text-white text-xs">
        <div className="flex items-center justify-between">
          <div>
            Debug Mode | Session Status: <span className="text-cyan-400">{status}</span>
            {session?.user?.email && <> | User: <span className="text-cyan-400">{session.user.email}</span></>}
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
            >
              {showDebugInfo ? 'Hide Debug' : 'Show Debug'}
            </button>
            <Link 
              href="/reset-profile"
              className="px-2 py-1 bg-red-800 hover:bg-red-700 rounded text-xs"
            >
              Reset Profile
            </Link>
            <Link 
              href="/userprofile"
              className="px-2 py-1 bg-blue-800 hover:bg-blue-700 rounded text-xs"
            >
              Normal Profile
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto max-w-4xl pt-12 pb-8">
        {showDebugInfo && (
          <div className="mb-4 p-4 bg-[rgba(0,0,0,0.6)] text-white rounded overflow-auto max-h-[300px] text-xs">
            <h3 className="font-bold mb-2">LocalStorage Contents:</h3>
            <pre className="whitespace-pre-wrap">
              {storageItems.map(({ key, value }, index) => (
                <div key={index} className="mb-2">
                  <div><span className="text-cyan-400">{key}</span></div>
                  <div className="pl-4">{value}</div>
                </div>
              ))}
            </pre>
          </div>
        )}
        
        <UserProfilePanel />
      </div>
    </div>
  );
} 