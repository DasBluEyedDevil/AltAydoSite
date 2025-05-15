'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function InsertTestPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/db-test/insert');
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
        <h1 className="mg-title text-xl mb-2 text-center">Database INSERT Permission Test</h1>
        <p className="text-center text-sm mb-6 text-[rgba(var(--mg-text),0.7)]">
          This test checks if your database user has INSERT permissions
        </p>
        
        <div className="mb-6">
          <button 
            onClick={runTest}
            disabled={loading}
            className="mg-button w-full py-2 px-4 relative overflow-hidden"
          >
            {loading ? 'Testing INSERT Permission...' : 'Run INSERT Permission Test'}
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
              <p className="font-medium">INSERT Permission: {results.canInsert ? 'Granted' : 'Denied'}</p>
              <p className="mb-2">{results.message}</p>
              
              {!results.success && results.error && (
                <div className="mt-4 p-3 bg-[rgba(0,0,0,0.2)] rounded text-xs font-mono overflow-auto">
                  <p><strong>Error:</strong> {results.error}</p>
                  {results.errorType && <p><strong>Error Type:</strong> {results.errorType}</p>}
                  {results.errorCode && <p><strong>Error Code:</strong> {results.errorCode}</p>}
                </div>
              )}
            </div>
            
            {/* Recommendations based on results */}
            <div className="border rounded-sm overflow-hidden">
              <div className="bg-[rgba(var(--mg-panel-dark),0.5)] p-3 border-b border-[rgba(var(--mg-primary),0.2)]">
                <h3 className="font-medium">What This Means</h3>
              </div>
              <div className="p-4">
                {results.success ? (
                  <div className="text-sm">
                    <p className="mb-2">✅ <strong>Good news!</strong> Your database user has INSERT permissions.</p>
                    <p>This means your application should be able to create new records in the database. If you're still having issues with user registration, the problem is likely elsewhere in your code or configuration.</p>
                  </div>
                ) : (
                  <div className="text-sm">
                    <p className="mb-2">❌ <strong>Permission Issue Detected:</strong> Your database user lacks INSERT permissions.</p>
                    <p className="mb-2">This explains why your user registration isn't working. You need to grant INSERT permissions to your database user.</p>
                    <div className="bg-[rgba(var(--mg-panel-dark),0.3)] p-3 rounded-sm mt-4 font-mono text-xs">
                      <p className="mb-1">-- Example PostgreSQL command to grant permissions:</p>
                      <p>GRANT INSERT ON "User" TO your_db_user;</p>
                      <p>-- Or for all tables:</p>
                      <p>GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_user;</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
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