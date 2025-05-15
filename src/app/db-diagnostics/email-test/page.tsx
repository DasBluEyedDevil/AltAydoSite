'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function EmailCheckTestPage() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!email) {
      setError('Please enter an email to check');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/db-test/email-check?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      
      console.log("Email check response:", data);
      setResult(data);
      
      if (!response.ok) {
        setError(data.error || 'Failed to check email');
      }
    } catch (error) {
      console.error('Email check error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mg-panel p-6 rounded-sm max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/db-diagnostics" className="text-[rgba(var(--mg-primary),0.8)] hover:text-[rgba(var(--mg-primary),1)] flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Diagnostics
          </Link>
        </div>

        <div className="text-center mb-6">
          <h2 className="mg-title text-xl mb-1">EMAIL EXISTENCE CHECK TEST</h2>
          <div className="mg-subtitle text-xs tracking-wider">TEST DATABASE EMAIL LOOKUP FUNCTIONALITY</div>
        </div>

        <div className="mb-6">
          <label className="mg-subtitle text-xs mb-1 block tracking-wider">EMAIL TO CHECK</label>
          <div className="flex space-x-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mg-input flex-1 bg-[rgba(var(--mg-panel-dark),0.5)] border border-[rgba(var(--mg-primary),0.2)] rounded-sm px-3 py-2 text-sm focus:border-[rgba(var(--mg-primary),0.5)] focus:outline-none transition-colors"
              placeholder="Enter email address"
            />
            <motion.button
              onClick={handleCheck}
              className={`mg-button px-4 py-2 relative overflow-hidden ${isLoading ? 'opacity-80' : 'hover:bg-[rgba(var(--mg-primary),0.1)]'}`}
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? 'CHECKING...' : 'CHECK'}
            </motion.button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-[rgba(var(--mg-error),0.1)] border border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.8)] rounded-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {result && (
          <div className="mt-6">
            <h3 className="mg-title text-sm mb-3">RESULT</h3>
            <div className="bg-[rgba(var(--mg-panel-dark),0.5)] p-4 rounded-sm border border-[rgba(var(--mg-primary),0.2)] font-mono text-sm overflow-x-auto">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-sm border border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-panel-dark),0.3)]">
                <div className="text-xs font-quantify mb-1 text-[rgba(var(--mg-primary),0.8)]">DATABASE CONNECTION</div>
                <div className={`text-sm ${result.prismaInitialized ? 'text-[rgba(var(--mg-success),0.8)]' : 'text-[rgba(var(--mg-error),0.8)]'}`}>
                  {result.prismaInitialized ? 'CONNECTED' : 'DISCONNECTED'}
                </div>
              </div>
              
              <div className="p-3 rounded-sm border border-[rgba(var(--mg-primary),0.2)] bg-[rgba(var(--mg-panel-dark),0.3)]">
                <div className="text-xs font-quantify mb-1 text-[rgba(var(--mg-primary),0.8)]">EMAIL STATUS</div>
                <div className={`text-sm ${result.exists ? 'text-[rgba(var(--mg-warning),0.8)]' : 'text-[rgba(var(--mg-success),0.8)]'}`}>
                  {result.exists ? 'ALREADY REGISTERED' : 'AVAILABLE'}
                </div>
              </div>
            </div>

            {result.user && (
              <div className="mt-4">
                <h3 className="mg-title text-sm mb-2">USER DETAILS</h3>
                <div className="bg-[rgba(var(--mg-panel-dark),0.3)] p-3 rounded-sm border border-[rgba(var(--mg-primary),0.2)]">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-[rgba(var(--mg-text),0.6)]">ID:</span> {result.user.id}
                    </div>
                    <div>
                      <span className="text-[rgba(var(--mg-text),0.6)]">Handle:</span> {result.user.aydoHandle}
                    </div>
                    <div>
                      <span className="text-[rgba(var(--mg-text),0.6)]">Role:</span> {result.user.role}
                    </div>
                    <div>
                      <span className="text-[rgba(var(--mg-text),0.6)]">Clearance:</span> {result.user.clearanceLevel}
                    </div>
                    <div className="col-span-2">
                      <span className="text-[rgba(var(--mg-text),0.6)]">Created:</span> {new Date(result.user.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 border-t border-[rgba(var(--mg-primary),0.1)] pt-4">
          <h3 className="mg-title text-sm mb-2">DIAGNOSTIC INFORMATION</h3>
          <ul className="text-xs space-y-1 text-[rgba(var(--mg-text),0.7)]">
            <li>• This tool tests the database email lookup functionality</li>
            <li>• If database connection fails, check your environment variables</li>
            <li>• Successful query with no results means the email is available</li>
            <li>• If signup fails but this test succeeds, the issue is elsewhere in your API</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
