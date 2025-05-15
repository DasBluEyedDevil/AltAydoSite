'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DbTestPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/db-test');
      const data = await response.json();
      setTestResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setTestResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[rgba(var(--mg-panel),0.8)] backdrop-blur-md p-6 rounded-sm relative">
        <h1 className="mg-title text-2xl mb-2 text-center">Database Diagnostics</h1>
        <p className="text-center text-sm mb-6 text-[rgba(var(--mg-text),0.7)]">
          Tools to verify your RDS database connection is working properly
        </p>
        
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <button 
            onClick={testConnection}
            disabled={loading}
            className="mg-button py-2 px-4 relative overflow-hidden"
          >
            {loading ? 'Testing...' : 'Quick Connection Test'}
          </button>
          
          <Link href="/db-diagnostics/detailed">
            <button 
              className="mg-button py-2 px-4 relative overflow-hidden w-full"
            >
              Detailed DB Diagnostics
            </button>
          </Link>
          
          <Link href="/db-diagnostics/env">
            <button 
              className="mg-button py-2 px-4 relative overflow-hidden w-full"
            >
              Check Environment Variables
            </button>
          </Link>
          
          <Link href="/db-diagnostics/schema">
            <button 
              className="mg-button py-2 px-4 relative overflow-hidden w-full"
            >
              Database Schema Analysis
            </button>
          </Link>
          
          <Link href="/db-diagnostics/query">
            <button 
              className="mg-button py-2 px-4 relative overflow-hidden w-full"
            >
              Test Query Operations
            </button>
          </Link>
          
          <Link href="/db-diagnostics/insert">
            <button 
              className="mg-button py-2 px-4 relative overflow-hidden w-full bg-[rgba(var(--mg-warning),0.1)]"
            >
              Test INSERT Permissions
            </button>
          </Link>
          
          <Link href="/signup">
            <button 
              className="mg-button py-2 px-4 relative overflow-hidden w-full col-span-1 md:col-span-2"
            >
              Return to Signup Page
            </button>
          </Link>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-[rgba(var(--mg-error),0.1)] border border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.8)] rounded-sm">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {testResult && (
          <div className={`mb-4 p-4 border rounded-sm ${
            testResult.status === 'success' 
              ? 'bg-[rgba(var(--mg-success),0.1)] border-[rgba(var(--mg-success),0.3)] text-[rgba(var(--mg-success),0.8)]' 
              : 'bg-[rgba(var(--mg-error),0.1)] border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.8)]'
          }`}>
            <p className="font-medium">Status: {testResult.status}</p>
            <p className="mb-2">{testResult.message}</p>
            
            <div className="text-sm mt-4">
              <p><strong>Timestamp:</strong> {testResult.timestamp}</p>
              
              {testResult.connection && (
                <div className="mt-2">
                  <p><strong>Provider:</strong> {testResult.connection.provider}</p>
                  <p><strong>Connected:</strong> {testResult.connection.connected ? 'Yes' : 'No'}</p>
                </div>
              )}
              
              {testResult.error && (
                <div className="mt-2">
                  <p><strong>Error Type:</strong> {testResult.error.name}</p>
                  <p><strong>Error Message:</strong> {testResult.error.message}</p>
                  {testResult.error.stack && (
                    <details className="mt-2">
                      <summary>Stack Trace</summary>
                      <pre className="mt-2 p-2 bg-black bg-opacity-20 text-xs overflow-auto">
                        {testResult.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="text-sm mt-6 bg-[rgba(var(--mg-panel-dark),0.3)] p-4 rounded-sm border border-[rgba(var(--mg-primary),0.1)]">
          <p className="font-bold mb-2">Troubleshooting RDS Connectivity:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Verify your database credentials in <code>.env.local</code> file</li>
            <li>Check that your RDS security group allows connections from your app's IP</li>
            <li>Make sure your database instance is running and accessible</li>
            <li>Verify that your VPC and subnet configurations allow outbound traffic</li>
            <li>Check that Prisma schema matches your database schema</li>
            <li>Ensure your environment variables are properly set in your deployment platform</li>
          </ol>
          
          <div className="mt-4 text-xs text-[rgba(var(--mg-text),0.6)]">
            Note: For AWS Amplify deployments, environment variables must be configured in the Amplify Console and encrypted if they contain sensitive data like database passwords.
          </div>
        </div>
      </div>
    </div>
  );
} 