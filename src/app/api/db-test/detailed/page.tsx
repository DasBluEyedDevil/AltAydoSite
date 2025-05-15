'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DetailedDbTestPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/db-test/detailed');
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
      <div className="w-full max-w-2xl bg-[rgba(var(--mg-panel),0.8)] backdrop-blur-md p-6 rounded-sm relative">
        <h1 className="mg-title text-xl mb-2 text-center">Database Diagnostics</h1>
        <p className="text-center text-sm mb-6 text-[rgba(var(--mg-text),0.7)]">
          Detailed test of RDS database connectivity and functionality
        </p>
        
        <div className="mb-6">
          <button 
            onClick={runTest}
            disabled={loading}
            className="mg-button w-full py-2 px-4 relative overflow-hidden"
          >
            {loading ? 'Running Diagnostics...' : 'Run Database Diagnostics'}
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
              results.status === 'success' 
                ? 'bg-[rgba(var(--mg-success),0.1)] border-[rgba(var(--mg-success),0.3)] text-[rgba(var(--mg-success),0.8)]' 
                : results.status === 'partial_failure'
                ? 'bg-[rgba(var(--mg-warning),0.1)] border-[rgba(var(--mg-warning),0.3)] text-[rgba(var(--mg-warning),0.8)]'
                : 'bg-[rgba(var(--mg-error),0.1)] border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.8)]'
            }`}>
              <p className="font-medium">Status: {results.status}</p>
              <p className="mb-2">{results.message}</p>
              
              <div className="text-sm mt-4">
                <p><strong>Timestamp:</strong> {results.timestamp}</p>
                <p><strong>Environment:</strong> {results.environment}</p>
                <p><strong>Database URL:</strong> {results.databaseUrl}</p>
              </div>
            </div>
            
            {results.results && (
              <div className="space-y-4">
                {/* Connection Test */}
                <div className={`p-4 border rounded-sm ${
                  results.results.connection.success
                    ? 'bg-[rgba(var(--mg-success),0.1)] border-[rgba(var(--mg-success),0.3)] text-[rgba(var(--mg-success),0.8)]'
                    : 'bg-[rgba(var(--mg-error),0.1)] border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.8)]'
                }`}>
                  <p className="font-medium">
                    <span className="inline-block w-5 h-5 mr-2 rounded-full border text-center leading-5">
                      1
                    </span>
                    Database Connection Test
                  </p>
                  <div className="ml-7 mt-2">
                    <p>Status: {results.results.connection.success ? 'Success' : 'Failed'}</p>
                    {results.results.connection.error && (
                      <p className="text-sm mt-1">Error: {results.results.connection.error}</p>
                    )}
                  </div>
                </div>
                
                {/* User Table Test */}
                <div className={`p-4 border rounded-sm ${
                  results.results.userTable.success
                    ? 'bg-[rgba(var(--mg-success),0.1)] border-[rgba(var(--mg-success),0.3)] text-[rgba(var(--mg-success),0.8)]'
                    : 'bg-[rgba(var(--mg-error),0.1)] border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.8)]'
                }`}>
                  <p className="font-medium">
                    <span className="inline-block w-5 h-5 mr-2 rounded-full border text-center leading-5">
                      2
                    </span>
                    User Table Access
                  </p>
                  <div className="ml-7 mt-2">
                    <p>Status: {results.results.userTable.success ? 'Success' : 'Failed'}</p>
                    {results.results.userTable.success && (
                      <p className="text-sm mt-1">User Count: {results.results.userTable.count}</p>
                    )}
                    {results.results.userTable.error && (
                      <p className="text-sm mt-1">Error: {results.results.userTable.error}</p>
                    )}
                  </div>
                </div>
                
                {/* Schema Validation Test */}
                <div className={`p-4 border rounded-sm ${
                  results.results.schemaValidation.success
                    ? 'bg-[rgba(var(--mg-success),0.1)] border-[rgba(var(--mg-success),0.3)] text-[rgba(var(--mg-success),0.8)]'
                    : 'bg-[rgba(var(--mg-error),0.1)] border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.8)]'
                }`}>
                  <p className="font-medium">
                    <span className="inline-block w-5 h-5 mr-2 rounded-full border text-center leading-5">
                      3
                    </span>
                    Schema Validation
                  </p>
                  <div className="ml-7 mt-2">
                    <p>Status: {results.results.schemaValidation.success ? 'Success' : 'Failed'}</p>
                    {results.results.schemaValidation.error && (
                      <p className="text-sm mt-1">Error: {results.results.schemaValidation.error}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {results.error && (
              <div className="p-4 border rounded-sm bg-[rgba(var(--mg-error),0.1)] border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.8)]">
                <p className="font-medium">Error Information</p>
                <p className="text-sm mt-1">Name: {results.error.name}</p>
                <p className="text-sm">Message: {results.error.message}</p>
                
                {results.error.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm">Show Stack Trace</summary>
                    <pre className="text-xs mt-2 p-2 bg-black bg-opacity-25 overflow-x-auto whitespace-pre-wrap">
                      {results.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="text-sm mt-6 text-[rgba(var(--mg-text),0.7)]">
          <p className="font-bold mb-2">Common Issues & Solutions:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Connection error: Check security groups, VPC settings, and network ACLs</li>
            <li>User table error: Verify migrations have run successfully and table exists</li>
            <li>Schema validation error: Run Prisma migration or update schema to match database</li>
            <li>Check that your database credentials in environment variables are correct</li>
          </ul>
        </div>
        
        <div className="mt-6 pt-4 border-t border-[rgba(var(--mg-primary),0.2)]">
          <Link 
            href="/api/db-test"
            className="text-sm text-[rgba(var(--mg-primary),0.8)] hover:text-[rgba(var(--mg-primary),1)]"
          >
            « Back to Basic DB Test
          </Link>
        </div>
      </div>
    </div>
  );
} 