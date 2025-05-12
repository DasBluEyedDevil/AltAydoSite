'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

function LoginForm() {
  const [aydoHandle, setAydoHandle] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  // Get the callback URL (where to redirect after successful login)
  const callbackUrl = searchParams?.get('from') || '/dashboard';

  useEffect(() => {
    // Check if redirected from successful signup
    if (searchParams?.get('signup') === 'success') {
      setSuccessMessage('Account created successfully. Please log in.');
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    
    try {
      const result = await signIn('credentials', {
        aydoHandle,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        setAuthError(result.error);
        setIsLoading(false);
      } else {
        // Successfully authenticated
        if (searchParams?.get('from')) {
          router.push(searchParams.get('from') as string);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthError('An unexpected error occurred during authentication');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mg-panel bg-[rgba(var(--mg-panel),0.8)] backdrop-blur-md p-6 rounded-sm relative">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-5 h-5 border-l border-t border-[rgba(var(--mg-primary),0.5)]"></div>
          <div className="absolute top-0 right-0 w-5 h-5 border-r border-t border-[rgba(var(--mg-primary),0.5)]"></div>
          <div className="absolute bottom-0 left-0 w-5 h-5 border-l border-b border-[rgba(var(--mg-primary),0.5)]"></div>
          <div className="absolute bottom-0 right-0 w-5 h-5 border-r border-b border-[rgba(var(--mg-primary),0.5)]"></div>
          
          <div className="text-center mb-6">
            <h2 className="mg-title text-xl mb-1">AYDO<span className="mg-subtitle font-light">CORP</span></h2>
            <div className="mg-subtitle text-xs tracking-wider">EMPLOYEE AUTHENTICATION</div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <motion.div 
                className="mb-4 p-2 bg-[rgba(var(--mg-error),0.1)] border border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.8)] text-xs rounded-sm"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </motion.div>
            )}
            
            <div className="mg-input-group mb-4">
              <label className="mg-subtitle text-xs mb-1 block tracking-wider">AYDOCORP HANDLE</label>
              <div className="relative">
                <input
                  type="text"
                  value={aydoHandle}
                  onChange={(e) => setAydoHandle(e.target.value)}
                  className="mg-input w-full bg-[rgba(var(--mg-panel-dark),0.5)] border border-[rgba(var(--mg-primary),0.2)] rounded-sm px-3 py-2 text-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none transition-colors font-quantify tracking-wide"
                  placeholder="ENTER HANDLE"
                />
                <div className="absolute top-0 left-0 w-[6px] h-[6px] border-l border-t border-[rgba(var(--mg-primary),0.4)]"></div>
              </div>
            </div>
            
            <div className="mg-input-group mb-6">
              <label className="mg-subtitle text-xs mb-1 block tracking-wider">PASSWORD</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mg-input w-full bg-[rgba(var(--mg-panel-dark),0.5)] border border-[rgba(var(--mg-primary),0.2)] rounded-sm px-3 py-2 text-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none transition-colors font-quantify tracking-wide"
                  placeholder="••••••••••••"
                />
                <div className="absolute top-0 left-0 w-[6px] h-[6px] border-l border-t border-[rgba(var(--mg-primary),0.4)]"></div>
              </div>
            </div>
            
            <motion.button
              type="submit"
              className={`mg-button w-full py-2 px-4 relative overflow-hidden ${isLoading ? 'opacity-80' : 'hover:bg-[rgba(var(--mg-primary),0.1)]'}`}
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative z-10 font-quantify tracking-wider text-sm">
                {isLoading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
              </div>
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="scanner-line"></div>
                </div>
              )}
            </motion.button>
          </form>
          
          <div className="mt-4 text-center text-[rgba(var(--mg-text),0.5)] text-xs">
            <span>Don't have an account? <Link href="/signup" className="text-[rgba(var(--mg-primary),0.8)] hover:text-[rgba(var(--mg-primary),1)]">Sign up here</Link></span>
          </div>
        </div>
        
        <div className="mg-text text-xs text-center mt-4 text-[rgba(var(--mg-text),0.6)]">
          <div className="inline-flex items-center">
            <div className="w-1 h-1 bg-[rgba(var(--mg-primary),0.4)] mr-1 rounded-full"></div>
            <span className="font-quantify tracking-wide">AYDO CORP SECURITY SYSTEM</span>
            <div className="w-1 h-1 bg-[rgba(var(--mg-primary),0.4)] ml-1 rounded-full"></div>
          </div>
        </div>
      </motion.div>
      
      {/* Display authentication errors */}
      {authError && (
        <div className="mt-4 p-2 bg-[rgba(var(--mg-danger),0.1)] border border-[rgba(var(--mg-danger),0.3)] text-[rgba(var(--mg-danger),1)] text-xs rounded">
          {authError}
        </div>
      )}
      
      {/* Display success message */}
      {successMessage && (
        <div className="mt-4 p-2 bg-[rgba(var(--mg-success),0.1)] border border-[rgba(var(--mg-success),0.3)] text-[rgba(var(--mg-success),1)] text-xs rounded">
          {successMessage}
        </div>
      )}
    </div>
  );
}

// Simple loading component for suspense
function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="mb-2">
          <div className="inline-block w-6 h-6 border-2 border-[rgba(var(--mg-primary),0.5)] border-t-[rgba(var(--mg-primary),1)] rounded-full animate-spin"></div>
        </div>
        <div className="text-xs text-[rgba(var(--mg-text),0.7)]">Loading authentication...</div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
} 