'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SignupTestPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/db-test/signup-test');
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[rgba(var(--mg-panel),0.8)] backdrop-blur-md p-6 rounded-sm relative">
        <h1 className="mg-title text-xl mb-2 text-center">Signup Flow Simulation Test</h1>
        <p className="text-center text-sm mb-6 text-[rgba(var(--mg-text),0.7)]">
          This test simulates the exact signup flow with test data to diagnose specific issues
        </p>
        
        <div className="mb-6">
          <button 
            onClick={runTest}
            disabled={loading}
            className="mg-button w-full py-2 px-4 relative overflow-hidden"
          >
            {loading ? 'Testing Signup Flow...' : 'Run Signup Simulation Test'}
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-[rgba(var(--mg-error),0.1)] border border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.8)] rounded-sm">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {results && (
          <div className="mb-4 space-y-4">
            <div className={`p-4 border rounded-sm ${
              results.success 
                ? 'bg-[rgba(var(--mg-success),0.1)] border-[rgba(var(--mg-success),0.3)] text-[rgba(var(--mg-success),0.8)]' 
                : 'bg-[rgba(var(--mg-error),0.1)] border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.8)]'
            }`}>
              <p className="font-medium">Signup Test: {results.success ? 'Passed' : 'Failed'}</p>
              <p className="mb-2">{results.message}</p>
            </div>
            
            {/* Detailed test results */}
            {results.results && (
              <div className="border rounded-sm overflow-hidden">
                <div className="bg-[rgba(var(--mg-panel-dark),0.5)] p-3 border-b border-[rgba(var(--mg-primary),0.2)]">
                  <h3 className="font-medium">Detailed Test Results</h3>
                </div>
                <div className="divide-y divide-[rgba(var(--mg-primary),0.1)]">
                  {/* Connection Test */}
                  <div className={`p-4 ${
                    results.results.connection.success 
                      ? 'text-[rgba(var(--mg-success),0.8)]' 
                      : 'text-[rgba(var(--mg-error),0.8)]'
                  }`}>
                    <p className="font-medium">1. Database Connection</p>
                    <p className="text-sm">
                      {results.results.connection.success 
                        ? 'Connection successful' 
                        : `Connection failed: ${results.results.connection.error}`}
                    </p>
                  </div>
                  
                  {/* Password Hashing Test */}
                  <div className={`p-4 ${
                    results.results.hashPassword.success 
                      ? 'text-[rgba(var(--mg-success),0.8)]' 
                      : 'text-[rgba(var(--mg-error),0.8)]'
                  }`}>
                    <p className="font-medium">2. Password Hashing</p>
                    <p className="text-sm">
                      {results.results.hashPassword.success 
                        ? 'Password hashing successful' 
                        : `Password hashing failed: ${results.results.hashPassword.error}`}
                    </p>
                  </div>
                  
                  {/* User Creation Test */}
                  <div className={`p-4 ${
                    results.results.createUser.success 
                      ? 'text-[rgba(var(--mg-success),0.8)]' 
                      : 'text-[rgba(var(--mg-error),0.8)]'
                  }`}>
                    <p className="font-medium">3. User Creation</p>
                    <p className="text-sm">
                      {results.results.createUser.success 
                        ? `User created successfully with ID: ${results.results.createUser.userId}` 
                        : `User creation failed: ${results.results.createUser.error}`}
                    </p>
                  </div>
                  
                  {/* Cleanup Test */}
                  <div className={`p-4 ${
                    results.results.cleanup.success 
                      ? 'text-[rgba(var(--mg-success),0.8)]' 
                      : 'text-[rgba(var(--mg-warning),0.8)]'
                  }`}>
                    <p className="font-medium">4. Test Cleanup</p>
                    <p className="text-sm">
                      {results.results.cleanup.success 
                        ? 'Cleanup successful' 
                        : `Cleanup failed: ${results.results.cleanup.error}`}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Recommendations */}
            {results.recommendations && results.recommendations.length > 0 && (
              <div className="border rounded-sm overflow-hidden">
                <div className="bg-[rgba(var(--mg-panel-dark),0.5)] p-3 border-b border-[rgba(var(--mg-primary),0.2)]">
                  <h3 className="font-medium">Troubleshooting Recommendations</h3>
                </div>
                <div className="p-4">
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {results.recommendations.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {results.success && (
              <div className="p-4 bg-[rgba(var(--mg-success),0.05)] border border-[rgba(var(--mg-success),0.2)] rounded-sm">
                <p className="text-sm mb-1"><strong>Test Successful:</strong> This means your database and user creation logic works properly in isolation.</p>
                <p className="text-sm">Since this test works but your actual signup form doesn't, the issue is likely in how your form data is being sent or processed. Check for:</p>
                <ul className="list-disc pl-5 mt-2 text-xs space-y-1 text-[rgba(var(--mg-text),0.7)]">
                  <li>Form data formatting differences between this test and your actual form</li>
                  <li>Validation issues in the form that prevent submission</li>
                  <li>Network issues or CORS problems when submitting from the browser</li>
                  <li>Differences in error handling between this test and your actual signup flow</li>
                </ul>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t border-[rgba(var(--mg-primary),0.2)]">
          <Link 
            href="/db-diagnostics"
            className="text-sm text-[rgba(var(--mg-primary),0.8)] hover:text-[rgba(var(--mg-primary),1)]"
          >
            « Back to DB Diagnostics
          </Link>
        </div>
      </div>
    </div>
  );
} 