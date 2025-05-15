'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function EmailCheckPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/db-test/email-check');
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
        <h1 className="mg-title text-xl mb-2 text-center">Email Check Diagnostic</h1>
        <p className="text-center text-sm mb-6 text-[rgba(var(--mg-text),0.7)]">
          This test specifically checks the email lookup functionality that's failing during signup
        </p>
        
        <div className="mb-6">
          <button 
            onClick={runTest}
            disabled={loading}
            className="mg-button w-full py-2 px-4 relative overflow-hidden"
          >
            {loading ? 'Testing Email Check...' : 'Run Email Check Test'}
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
              <p className="font-medium">Email Check Test: {results.success ? 'Passed' : 'Failed'}</p>
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
                  
                  {/* Raw Query Test */}
                  <div className={`p-4 ${
                    results.results.rawQuery.success 
                      ? 'text-[rgba(var(--mg-success),0.8)]' 
                      : 'text-[rgba(var(--mg-error),0.8)]'
                  }`}>
                    <p className="font-medium">2. Email Column Check</p>
                    <p className="text-sm">
                      {results.results.rawQuery.success 
                        ? 'Email column exists and is accessible' 
                        : `Email column check failed: ${results.results.rawQuery.error}`}
                    </p>
                  </div>
                  
                  {/* Email Check Test */}
                  <div className={`p-4 ${
                    results.results.emailCheck.success 
                      ? 'text-[rgba(var(--mg-success),0.8)]' 
                      : 'text-[rgba(var(--mg-error),0.8)]'
                  }`}>
                    <p className="font-medium">3. Prisma Email Check</p>
                    <p className="text-sm">
                      {results.results.emailCheck.success 
                        ? 'Prisma email lookup successful' 
                        : `Prisma email lookup failed: ${results.results.emailCheck.error}`}
                    </p>
                  </div>
                  
                  {/* Client Info */}
                  <div className={`p-4 ${
                    results.results.clientInfo.success 
                      ? 'text-[rgba(var(--mg-success),0.8)]' 
                      : 'text-[rgba(var(--mg-warning),0.8)]'
                  }`}>
                    <p className="font-medium">4. Database Info</p>
                    <p className="text-sm">
                      {results.results.clientInfo.success 
                        ? 'Database info retrieved successfully' 
                        : `Database info retrieval failed: ${results.results.clientInfo.error}`}
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
            
            <div className="p-4 bg-[rgba(var(--mg-panel-dark),0.3)] border border-[rgba(var(--mg-primary),0.1)] rounded-sm">
              <h3 className="font-medium mb-2">Next Steps</h3>
              <p className="text-sm mb-2">
                If this test passes, the issue might be with how the email is being sent from your form. Try:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Check if your form email input has any validation or formatting that might be causing issues</li>
                <li>Add <code>console.log(email)</code> to the beginning of your signup API to see the exact value received</li>
                <li>Test with a very simple email (like "test@example.com") without special characters</li>
                <li>Check your production database connection pool settings</li>
              </ul>
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