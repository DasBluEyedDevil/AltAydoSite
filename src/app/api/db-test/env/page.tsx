'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function EnvTestPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkEnv = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/db-test/env');
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
        <h1 className="mg-title text-xl mb-2 text-center">Environment Variables Check</h1>
        <p className="text-center text-sm mb-6 text-[rgba(var(--mg-text),0.7)]">
          Verify your database environment variables are properly configured
        </p>
        
        <div className="mb-6">
          <button 
            onClick={checkEnv}
            disabled={loading}
            className="mg-button w-full py-2 px-4 relative overflow-hidden"
          >
            {loading ? 'Checking Variables...' : 'Check Environment Variables'}
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-[rgba(var(--mg-error),0.1)] border border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.8)] rounded-sm">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {results && (
          <div className="mb-4">
            <div className={`p-4 border rounded-sm mb-4 ${
              results.status === 'success' 
                ? 'bg-[rgba(var(--mg-success),0.1)] border-[rgba(var(--mg-success),0.3)] text-[rgba(var(--mg-success),0.8)]' 
                : results.status === 'warning'
                ? 'bg-[rgba(var(--mg-warning),0.1)] border-[rgba(var(--mg-warning),0.3)] text-[rgba(var(--mg-warning),0.8)]'
                : 'bg-[rgba(var(--mg-error),0.1)] border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.8)]'
            }`}>
              <p className="font-medium">Status: {results.status}</p>
              <p className="mb-2">{results.message}</p>
              
              <div className="text-sm mt-4">
                <p><strong>Environment:</strong> {results.environment}</p>
                <p><strong>Timestamp:</strong> {results.timestamp}</p>
                <p><strong>Prisma Available:</strong> {results.prismaAvailable ? 'Yes' : 'No'}</p>
              </div>
            </div>
            
            {results.variables && (
              <div className="border rounded-sm overflow-hidden">
                <div className="bg-[rgba(var(--mg-panel-dark),0.5)] p-3 border-b border-[rgba(var(--mg-primary),0.2)]">
                  <h3 className="font-medium">Environment Variables</h3>
                </div>
                <div className="p-0">
                  <table className="w-full text-sm">
                    <thead className="bg-[rgba(var(--mg-panel-dark),0.3)]">
                      <tr>
                        <th className="p-2 text-left font-medium">Variable</th>
                        <th className="p-2 text-left font-medium">Status</th>
                        <th className="p-2 text-left font-medium">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(results.variables).map(([key, value]: [string, any]) => (
                        <tr key={key} className="border-t border-[rgba(var(--mg-primary),0.1)]">
                          <td className="p-2 font-mono text-xs">{key}</td>
                          <td className="p-2">
                            {typeof value === 'object' ? (
                              <span className={value.exists ? 'text-[rgba(var(--mg-success),0.8)]' : 'text-[rgba(var(--mg-error),0.8)]'}>
                                {value.exists ? '✓ Set' : '✗ Missing'}
                              </span>
                            ) : (
                              <span>{value === 'not set' ? 'Optional' : 'Set'}</span>
                            )}
                          </td>
                          <td className="p-2 font-mono text-xs">
                            {typeof value === 'object' ? (
                              value.masked || '-'
                            ) : (
                              value
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="text-sm mt-6 text-[rgba(var(--mg-text),0.7)]">
          <p className="font-bold mb-2">Environment Variables Tips:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>For local development, create a <code>.env.local</code> file with your database credentials</li>
            <li>For AWS Amplify, set environment variables in the Amplify Console</li>
            <li>The <code>DATABASE_URL</code> should follow the format: <code>postgresql://username:password@hostname:port/database</code></li>
            <li>Make sure to set <code>NEXTAUTH_SECRET</code> for secure authentication</li>
            <li>For production, ensure all sensitive variables are properly encrypted</li>
          </ul>
        </div>
        
        <div className="mt-6 pt-4 border-t border-[rgba(var(--mg-primary),0.2)]">
          <Link 
            href="/api/db-test"
            className="text-sm text-[rgba(var(--mg-primary),0.8)] hover:text-[rgba(var(--mg-primary),1)]"
          >
            « Back to DB Diagnostics
          </Link>
        </div>
      </div>
    </div>
  );
} 