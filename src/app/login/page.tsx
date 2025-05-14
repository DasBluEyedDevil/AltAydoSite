'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

function LoginForm() {
  const [aydoHandle, setAydoHandle] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(null);
  const { data: session, status, update } = useSession();

  // Redirect to dashboard only if explicitly authenticated
  useEffect(() => {
    // Only redirect if we have a confirmed authenticated session
    // and we're not in the middle of a login attempt
    if (status === 'authenticated' && session && session.user && !isLoading) {
      console.log("Login page - User is authenticated, preparing to redirect to landing page", 
        "user:", session.user.name, "clearance:", session.user.clearanceLevel);

      // Check if we have a reset parameter - if so, don't auto-redirect
      if (searchParams?.get('reset') === 'true') {
        console.log("Reset parameter detected, not auto-redirecting to landing page");
        return;
      }

      router.replace('/');
    }
  }, [status, router, session, isLoading, searchParams]);

  useEffect(() => {
    // Check if redirected from successful signup
    if (searchParams?.get('signup') === 'success') {
      setSuccessMessage('Account created successfully. Please log in.');
    }

    // Check if there was an error parameter
    if (searchParams?.get('error')) {
      if (searchParams.get('error') === 'token_expired') {
        setAuthError('Your session has expired. Please log in again.');
      } else if (searchParams.get('error') === 'session_error') {
        setAuthError('There was a problem with your session. Please log in again.');
      } else {
        setAuthError('Authentication failed. Please check your credentials and try again.');
      }
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    if (!aydoHandle || !password) {
      setAuthError("Please enter both your AydoCorp Handle and password.");
      setIsLoading(false);
      return;
    }

    console.log("Login attempt starting for:", aydoHandle);

    try {
      console.log("Calling signIn with credentials provider");
      const result = await signIn('credentials', {
        aydoHandle,
        password,
        redirect: false,
        callbackUrl: '/'
      });

      console.log("SignIn result:", result);

      if (result?.error) {
        console.error("Authentication error:", result.error);
        // Improved error handling for specific connection issues
        if (result.error.includes("Database connection error")) {
          setAuthError("Database connection failed. The system is currently unavailable. Please try again later or contact support.");
        } else {
          setAuthError("Invalid credentials. Please check your AydoCorp Handle and password.");
        }
        setIsLoading(false);
      } else if (result?.ok === true) {
        // Wait for the session to be updated before redirecting
        console.log("Authentication successful, updating session");

        try {
          // Force a session update and wait for it to complete
          await update();
          
          // Use router.push instead of replace to ensure proper navigation
          setIsLoading(false);
          console.log("Redirecting to landing page...");
          // Make sure we're using the correct URL path
          router.push('/');
        } catch (updateError) {
          console.error("Error updating session:", updateError);
          setAuthError("Failed to establish session. Please try again.");
          setIsLoading(false);
        }
      } else {
        // Unexpected result
        console.error("Unexpected authentication result:", result);
        setAuthError("An unexpected error occurred during authentication. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthError('An unexpected error occurred during authentication. Please try again later.');
      setIsLoading(false);
    }
  };

  // If still loading the session, show loading state
  if (status === 'loading') {
    return <LoginLoading />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-black bg-opacity-80 bg-[url('/images/spacebg.jpg')] bg-cover bg-center bg-blend-overlay">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mg-panel bg-[rgba(var(--mg-panel-dark),0.8)] backdrop-blur-md p-6 rounded-sm relative">
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-5 h-5 border-l border-t border-[rgba(var(--mg-primary),0.5)]"></div>
          <div className="absolute top-0 right-0 w-5 h-5 border-r border-t border-[rgba(var(--mg-primary),0.5)]"></div>
          <div className="absolute bottom-0 left-0 w-5 h-5 border-l border-b border-[rgba(var(--mg-primary),0.5)]"></div>
          <div className="absolute bottom-0 right-0 w-5 h-5 border-r border-b border-[rgba(var(--mg-primary),0.5)]"></div>

          <div className="text-center mb-6">
            <h2 className="mg-title text-xl mb-1">AYDO<span className="mg-subtitle font-light">CORP</span></h2>
            <div className="mg-subtitle text-xs tracking-wider">EMPLOYEE AUTHENTICATION</div>
          </div>

          {/* Success message for signup */}
          {successMessage && (
            <motion.div 
              className="mb-4 p-2 bg-[rgba(var(--mg-success),0.1)] border border-[rgba(var(--mg-success),0.3)] text-[rgba(var(--mg-success),0.8)] text-xs rounded-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" />
                </svg>
                {successMessage}
              </div>
            </motion.div>
          )}

          {authError && (
            <motion.div 
              className="mb-4 p-2 bg-[rgba(var(--mg-error),0.1)] border border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.8)] text-xs rounded-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {authError}
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mg-input-group mb-4">
              <label className="mg-subtitle text-xs mb-1 block tracking-wider">AYDOCORP HANDLE</label>
              <div className="relative">
                <input
                  type="text"
                  value={aydoHandle}
                  onChange={(e) => setAydoHandle(e.target.value)}
                  className="mg-input w-full bg-[rgba(var(--mg-panel-dark),0.5)] border border-[rgba(var(--mg-primary),0.2)] rounded-sm px-3 py-2 text-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none transition-colors font-quantify tracking-wide"
                  placeholder="ENTER HANDLE"
                  autoComplete="username"
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
                  autoComplete="current-password"
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

          {/* Sign up link */}
          <div className="mt-6 text-center text-xs text-[rgba(var(--mg-text),0.6)]">
            <span>Don't have an account? </span>
            <Link href="/signup" className="text-[rgba(var(--mg-primary),0.8)] hover:text-[rgba(var(--mg-primary),1)] hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Loading component
function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-opacity-80 bg-[url('/images/spacebg.jpg')] bg-cover bg-center bg-blend-overlay">
      <div className="mg-loading-spinner">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 border border-[rgba(var(--mg-primary),0.2)] rounded-sm"></div>
            <div className="absolute inset-0 border-t-2 border-l-2 border-[rgba(var(--mg-primary),0.8)] rounded-sm animate-spin"></div>
          </div>
          <div className="mt-4 font-quantify tracking-wider text-xs">ACCESSING SYSTEM</div>
        </div>
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
