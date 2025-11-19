'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetProfileComponent() {
  const router = useRouter();
  const [message, setMessage] = useState('Resetting profile data...');
  
  useEffect(() => {
    // Find all user profile keys in localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('user_profile_'))) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all user profile data
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Also clear session storage
    sessionStorage.clear();
    
    setMessage(`Reset complete. Removed ${keysToRemove.length} profile(s). Redirecting to profile page...`);
    
    // Redirect back to the profile page after 2 seconds
    const timer = setTimeout(() => {
      router.push('/userprofile');
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgba(var(--mg-bg),1)]">
      <div className="mg-panel p-8 max-w-md w-full text-center">
        <h1 className="text-lg mb-4 text-[rgba(var(--mg-primary),0.9)]">{message}</h1>
        <div className="animate-pulse bg-[rgba(var(--mg-primary),0.1)] h-1 w-full rounded-full overflow-hidden">
          <div className="bg-[rgba(var(--mg-primary),0.5)] h-full w-1/2 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}