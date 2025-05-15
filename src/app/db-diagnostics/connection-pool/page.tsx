'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ConnectionPoolPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Making request to /api/db-test/connection-pool...");
      const response = await fetch('/api/db-test/connection-pool');
      console.log("Received response:", response.status, response.statusText);
      
      if (!response.ok) {
        console.error("API returned error status:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("API response data:", data);
      setResults(data);
    } catch (err) {
      console.error("Error running connection test:", err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[rgba(var(--mg-panel),0.8)] backdrop-blur-md p-6 rounded-sm relative">
        <h1 className="mg-title text-xl mb-2 text-center">Connection Pool Diagnostic</h1>
        <p className="text-center text-sm mb-6 text-[rgba(var(--mg-text),0.7)]">
          This test evaluates your database connection pool and helps identify connection-related issues
        </p>
        
        <div className="mb-6">
          <button 
            onClick={runTest}
            disabled={loading}
            className="mg-button w-full py-2 px-4 relative overflow-hidden"
          >
            {loading ? 'Testing Connections...' : 'Run Connection Pool Test'}
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
              <p className="font-medium">Connection Pool Test: {results.success ? 'Completed' : 'Failed'}</p>
            </div>
            
            {/* Database Stats */}
            {results.results?.stats?.success && (
              <div className="border rounded-sm overflow-hidden">
                <div className="bg-[rgba(var(--mg-panel-dark),0.5)] p-3 border-b border-[rgba(var(--mg-primary),0.2)]">
                  <h3 className="font-medium">Database Information</h3>
                </div>
                <div className="p-4">
                  <pre className="bg-black/30 p-3 rounded-sm overflow-auto text-xs">
                    {JSON.stringify(results.results.stats.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            {/* Active Connections */}
            {results.results?.connections?.success && (
              <div className="border rounded-sm overflow-hidden">
                <div className="bg-[rgba(var(--mg-panel-dark),0.5)] p-3 border-b border-[rgba(var(--mg-primary),0.2)]">
                  <h3 className="font-medium">Active Database Connections</h3>
                </div>
                <div className="p-4">
                  <pre className="bg-black/30 p-3 rounded-sm overflow-auto text-xs">
                    {JSON.stringify(results.results.connections.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            {/* Sequential Queries */}
            {results.results?.sequential?.success && (
              <div className="border rounded-sm overflow-hidden">
                <div className="bg-[rgba(var(--mg-panel-dark),0.5)] p-3 border-b border-[rgba(var(--mg-primary),0.2)]">
                  <h3 className="font-medium">Sequential Query Test</h3>
                </div>
                <div className="p-4">
                  <p className="text-sm mb-2">
                    Time to complete 5 sequential queries: {results.results.sequential.data.time_ms}ms
                  </p>
                  <pre className="bg-black/30 p-3 rounded-sm overflow-auto text-xs">
                    {JSON.stringify(results.results.sequential.data.queries, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            {/* Concurrent Queries */}
            {results.results?.concurrent?.success && (
              <div className="border rounded-sm overflow-hidden">
                <div className="bg-[rgba(var(--mg-panel-dark),0.5)] p-3 border-b border-[rgba(var(--mg-primary),0.2)]">
                  <h3 className="font-medium">Concurrent Query Test</h3>
                </div>
                <div className="p-4">
                  <p className="text-sm mb-2">
                    Time to complete 5 concurrent queries: {results.results.concurrent.data.time_ms}ms
                  </p>
                  <pre className="bg-black/30 p-3 rounded-sm overflow-auto text-xs">
                    {JSON.stringify(results.results.concurrent.data.queries, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            {/* Recommendations */}
            {results.recommendations && results.recommendations.length > 0 && (
              <div className="border rounded-sm overflow-hidden">
                <div className="bg-[rgba(var(--mg-panel-dark),0.5)] p-3 border-b border-[rgba(var(--mg-primary),0.2)]">
                  <h3 className="font-medium">Recommendations</h3>
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