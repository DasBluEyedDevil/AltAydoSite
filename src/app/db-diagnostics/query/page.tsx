'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function QueryTestPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/db-test/query');
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
        <h1 className="mg-title text-xl mb-2 text-center">Database Query Diagnostics</h1>
        <p className="text-center text-sm mb-6 text-[rgba(var(--mg-text),0.7)]">
          Diagnose specific query issues that might prevent user creation
        </p>
        
        <div className="mb-6">
          <button 
            onClick={runTest}
            disabled={loading}
            className="mg-button w-full py-2 px-4 relative overflow-hidden"
          >
            {loading ? 'Testing Queries...' : 'Run Query Tests'}
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-[rgba(var(--mg-error),0.1)] border border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.8)] rounded-sm">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {results && (
          <div className="mb-4 space-y-6">
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
                <p><strong>Environment:</strong> {results.debug?.nodeEnv || 'unknown'}</p>
                <p><strong>Database URL:</strong> {results.debug?.databaseUrl || 'not set'}</p>
              </div>
            </div>
            
            {/* Test Results */}
            {results.results && (
              <>
                {/* Connection Test */}
                <div className={`p-4 border rounded-sm ${
                  results.results.connection.success
                    ? 'bg-[rgba(var(--mg-success),0.1)] border-[rgba(var(--mg-success),0.3)] text-[rgba(var(--mg-success),0.8)]'
                    : 'bg-[rgba(var(--mg-error),0.1)] border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.8)]'
                }`}>
                  <p className="font-medium">Database Connection</p>
                  <div className="mt-2">
                    <p><strong>Status:</strong> {results.results.connection.success ? 'Success' : 'Failed'}</p>
                    {results.results.connection.error && (
                      <div className="mt-1 p-2 bg-[rgba(0,0,0,0.2)] rounded text-xs font-mono overflow-auto">
                        {results.results.connection.error}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Raw Query Test */}
                <div className={`p-4 border rounded-sm ${
                  results.results.rawQuery.success
                    ? 'bg-[rgba(var(--mg-success),0.1)] border-[rgba(var(--mg-success),0.3)] text-[rgba(var(--mg-success),0.8)]'
                    : 'bg-[rgba(var(--mg-error),0.1)] border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.8)]'
                }`}>
                  <p className="font-medium">Raw SQL Query Test</p>
                  <div className="mt-2">
                    <p><strong>Status:</strong> {results.results.rawQuery.success ? 'Success' : 'Failed'}</p>
                    {results.results.rawQuery.error && (
                      <div className="mt-1 p-2 bg-[rgba(0,0,0,0.2)] rounded text-xs font-mono overflow-auto">
                        {results.results.rawQuery.error}
                      </div>
                    )}
                    
                    {results.results.rawQuery.result && (
                      <div className="mt-2">
                        <p><strong>User Table Columns:</strong></p>
                        <table className="w-full text-xs mt-1">
                          <thead className="bg-[rgba(var(--mg-panel-dark),0.3)]">
                            <tr>
                              <th className="p-1 text-left">Column</th>
                              <th className="p-1 text-left">Type</th>
                              <th className="p-1 text-left">Nullable</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.isArray(results.results.rawQuery.result) && 
                              results.results.rawQuery.result.map((col: any, i: number) => (
                                <tr key={i} className="border-t border-[rgba(var(--mg-primary),0.1)]">
                                  <td className="p-1 font-mono">{col.column_name}</td>
                                  <td className="p-1">{col.data_type}</td>
                                  <td className="p-1">{col.is_nullable}</td>
                                </tr>
                              ))
                            }
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Find First Test */}
                <div className={`p-4 border rounded-sm ${
                  results.results.findFirst.success
                    ? 'bg-[rgba(var(--mg-success),0.1)] border-[rgba(var(--mg-success),0.3)] text-[rgba(var(--mg-success),0.8)]'
                    : 'bg-[rgba(var(--mg-error),0.1)] border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.8)]'
                }`}>
                  <p className="font-medium">Prisma findFirst Test</p>
                  <div className="mt-2">
                    <p><strong>Status:</strong> {results.results.findFirst.success ? 'Success' : 'Failed'}</p>
                    {results.results.findFirst.error && (
                      <div className="mt-1 p-2 bg-[rgba(0,0,0,0.2)] rounded text-xs font-mono overflow-auto">
                        {results.results.findFirst.error}
                      </div>
                    )}
                    
                    {results.results.findFirst.result && typeof results.results.findFirst.result === 'object' && (
                      <div className="mt-2">
                        <p><strong>Found User:</strong></p>
                        <div className="mt-1 p-2 bg-[rgba(0,0,0,0.1)] rounded text-xs">
                          <pre className="font-mono overflow-auto">
                            {JSON.stringify(results.results.findFirst.result, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    {results.results.findFirst.result === 'No users found' && (
                      <p className="mt-1 text-xs font-medium">No users found in database</p>
                    )}
                  </div>
                </div>
                
                {/* Count Test */}
                <div className={`p-4 border rounded-sm ${
                  results.results.findMany.success
                    ? 'bg-[rgba(var(--mg-success),0.1)] border-[rgba(var(--mg-success),0.3)] text-[rgba(var(--mg-success),0.8)]'
                    : 'bg-[rgba(var(--mg-error),0.1)] border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.8)]'
                }`}>
                  <p className="font-medium">Prisma count Test</p>
                  <div className="mt-2">
                    <p><strong>Status:</strong> {results.results.findMany.success ? 'Success' : 'Failed'}</p>
                    
                    {results.results.findMany.success && (
                      <p><strong>User Count:</strong> {results.results.findMany.count}</p>
                    )}
                    
                    {results.results.findMany.error && (
                      <div className="mt-1 p-2 bg-[rgba(0,0,0,0.2)] rounded text-xs font-mono overflow-auto">
                        {results.results.findMany.error}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            
            {/* Troubleshooting Recommendations */}
            {results.results && (
              <div className="border rounded-sm overflow-hidden">
                <div className="bg-[rgba(var(--mg-panel-dark),0.5)] p-3 border-b border-[rgba(var(--mg-primary),0.2)]">
                  <h3 className="font-medium">Troubleshooting Recommendations</h3>
                </div>
                <div className="p-4">
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    {!results.results.connection.success && (
                      <li className="text-[rgba(var(--mg-error),0.8)]">
                        <span className="font-medium">Connection error:</span> Check your DATABASE_URL is correctly set and accessible.
                      </li>
                    )}
                    
                    {results.results.connection.success && !results.results.rawQuery.success && (
                      <li className="text-[rgba(var(--mg-error),0.8)]">
                        <span className="font-medium">SQL error:</span> The User table might be missing or inaccessible. Run Prisma migrations to create it.
                      </li>
                    )}
                    
                    {results.results.rawQuery.success && !results.results.findFirst.success && (
                      <li className="text-[rgba(var(--mg-error),0.8)]">
                        <span className="font-medium">Prisma query error:</span> There's a mismatch between your Prisma schema and the database.
                      </li>
                    )}
                    
                    {results.results.findFirst.success && !results.results.findMany.success && (
                      <li className="text-[rgba(var(--mg-warning),0.8)]">
                        <span className="font-medium">Count query error:</span> Permissions issue or schema mismatch affecting count operations.
                      </li>
                    )}
                    
                    {results.results.findFirst.error && results.results.findFirst.error.includes('column') && (
                      <li className="text-[rgba(var(--mg-error),0.8)]">
                        <span className="font-medium">Column mismatch:</span> One or more columns in your Prisma schema doesn't match the database.
                      </li>
                    )}
                    
                    {results.results.connection.success && results.results.rawQuery.success && 
                     results.results.findFirst.success && results.results.findMany.success && (
                      <li className="text-[rgba(var(--mg-success),0.8)]">
                        <span className="font-medium">All tests passed:</span> If you're still having issues, the problem might be with your specific inputs.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="text-sm mt-6 bg-[rgba(var(--mg-panel-dark),0.3)] p-4 rounded-sm border border-[rgba(var(--mg-primary),0.1)]">
          <p className="font-bold mb-2">Common Query Issues Solutions:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>If raw queries work but Prisma doesn't, run <code>npx prisma generate</code> to update your client</li>
            <li>For "column does not exist" errors, ensure your database schema matches Prisma schema</li>
            <li>For "relation does not exist" errors, check your database migrations have run properly</li>
            <li>Verify database permissions - the user needs CRUD access to all tables</li>
            <li>If column names are case sensitive, make sure Prisma and the DB use the same casing</li>
          </ol>
        </div>
        
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