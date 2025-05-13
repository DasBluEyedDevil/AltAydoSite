'use client';

import React, { useEffect, useState } from 'react';
import { initErrorMonitoring, getErrorLog, clearErrorLog } from '../lib/errorReporting';

export default function ServerErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  useEffect(() => {
    // Initialize error monitoring
    initErrorMonitoring();
    
    // Function to handle server component errors
    const handleServerError = (error: any) => {
      console.error('Server Component Error detected:', error);
      setHasError(true);
      
      // Try to extract the digest or other details that might help identify the issue
      if (error.digest) {
        setErrorDetails(`Error digest: ${error.digest}`);
      } else if (error.message) {
        setErrorDetails(error.message);
      }
    };
    
    // Listen for uncaught errors
    const handleWindowError = (event: ErrorEvent) => {
      if (event.error) {
        // Check for Server Components render error
        if (
          event.error.message?.includes('Server Components render') || 
          event.error.digest
        ) {
          handleServerError(event.error);
        }
        
        // Check for React error #419 (related to Suspense)
        if (event.error.message?.includes('Minified React error #419')) {
          handleServerError({
            message: 'React Suspense error. This may be related to data fetching or authentication.',
            digest: 'React-419'
          });
        }
      }
    };
    
    // Listen for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (
        event.reason && 
        (typeof event.reason === 'object' || typeof event.reason === 'string')
      ) {
        const reasonStr = typeof event.reason === 'string' 
          ? event.reason 
          : event.reason.message || JSON.stringify(event.reason);
          
        if (
          reasonStr.includes('Server Components render') || 
          reasonStr.includes('digest')
        ) {
          handleServerError(event.reason);
        }
      }
    };

    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (hasError) {
    const errorLog = getErrorLog();
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center max-w-md mx-auto p-6 border border-gray-700 rounded-lg bg-gray-900">
          <h2 className="text-xl font-bold mb-4">Server Component Error</h2>
          <p className="mb-4 text-gray-400 text-sm">
            We encountered an error while rendering page components. This could be due to a database connection issue or authentication problem.
          </p>
          {errorDetails && (
            <div className="mb-4 p-3 bg-gray-800 rounded text-left overflow-auto text-xs text-gray-300">
              <pre>{errorDetails}</pre>
            </div>
          )}
          
          {/* Debugging information toggle */}
          <div className="mb-4">
            <button 
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="text-xs text-gray-400 underline"
            >
              {showDebugInfo ? 'Hide' : 'Show'} Debug Information
            </button>
          </div>
          
          {/* Debug information */}
          {showDebugInfo && errorLog.length > 0 && (
            <div className="mb-4">
              <div className="text-left text-xs text-gray-400 mb-2">Recent Errors:</div>
              <div className="max-h-40 overflow-auto text-left bg-gray-800 p-2 rounded text-xs">
                {errorLog.map((error, i) => (
                  <div key={i} className="mb-2 pb-2 border-b border-gray-700">
                    <div>Type: {error.type}</div>
                    <div>Time: {new Date(error.timestamp).toLocaleString()}</div>
                    {error.digest && <div>Digest: {error.digest}</div>}
                    <div className="text-gray-500 truncate">{error.message}</div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => {
                  clearErrorLog();
                  setShowDebugInfo(false);
                }}
                className="text-xs text-gray-400 underline mt-2"
              >
                Clear Error Log
              </button>
            </div>
          )}
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 