'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SchemaPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSchema = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/db-test/schema');
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
        <h1 className="mg-title text-xl mb-2 text-center">Database Schema Diagnostics</h1>
        <p className="text-center text-sm mb-6 text-[rgba(var(--mg-text),0.7)]">
          Check database structure and compare with your Prisma schema
        </p>
        
        <div className="mb-6">
          <button 
            onClick={checkSchema}
            disabled={loading}
            className="mg-button w-full py-2 px-4 relative overflow-hidden"
          >
            {loading ? 'Analyzing Schema...' : 'Check Database Schema'}
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
                : 'bg-[rgba(var(--mg-error),0.1)] border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.8)]'
            }`}>
              <p className="font-medium">Status: {results.status}</p>
              <p className="mb-2">{results.message}</p>
              
              <div className="text-sm mt-4">
                <p><strong>Connection:</strong> {results.connected ? 'Successful' : 'Failed'}</p>
                <p><strong>Migration Table Exists:</strong> {results.migrationTable?.exists ? 'Yes' : 'No'}</p>
                {!results.migrationTable?.exists && (
                  <p className="text-[rgba(var(--mg-warning),0.8)]">
                    Warning: Prisma migration table not found. Database schema may not be initialized.
                  </p>
                )}
              </div>
            </div>
            
            {/* Database Tables */}
            {results.tables && Array.isArray(results.tables) && (
              <div className="border rounded-sm overflow-hidden">
                <div className="bg-[rgba(var(--mg-panel-dark),0.5)] p-3 border-b border-[rgba(var(--mg-primary),0.2)]">
                  <h3 className="font-medium">Database Tables</h3>
                </div>
                <div className="p-4">
                  {results.tables.length === 0 ? (
                    <p className="text-sm text-[rgba(var(--mg-error),0.8)]">No tables found in database!</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {results.tables.map((table: any, i: number) => (
                        <div key={i} className="text-sm bg-[rgba(var(--mg-panel-dark),0.3)] rounded p-2">
                          {table.table_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* User Table Schema */}
            {results.schemas?.User && Array.isArray(results.schemas.User) && (
              <div className="border rounded-sm overflow-hidden">
                <div className="bg-[rgba(var(--mg-panel-dark),0.5)] p-3 border-b border-[rgba(var(--mg-primary),0.2)]">
                  <h3 className="font-medium">User Table Schema</h3>
                </div>
                <div className="p-0">
                  <table className="w-full text-sm">
                    <thead className="bg-[rgba(var(--mg-panel-dark),0.3)]">
                      <tr>
                        <th className="p-2 text-left font-medium">Column</th>
                        <th className="p-2 text-left font-medium">Type</th>
                        <th className="p-2 text-left font-medium">Nullable</th>
                        <th className="p-2 text-left font-medium">Default</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.schemas.User.map((column: any, i: number) => (
                        <tr key={i} className="border-t border-[rgba(var(--mg-primary),0.1)]">
                          <td className="p-2 font-mono text-xs">{column.column_name}</td>
                          <td className="p-2">{column.data_type}</td>
                          <td className="p-2">{column.is_nullable === 'YES' ? 'Yes' : 'No'}</td>
                          <td className="p-2 font-mono text-xs">{column.column_default || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {!results.schemas?.User && (
              <div className="p-4 border rounded-sm bg-[rgba(var(--mg-error),0.1)] border-[rgba(var(--mg-error),0.3)] text-[rgba(var(--mg-error),0.8)]">
                <p className="font-medium">User Table Not Found</p>
                <p className="text-sm mt-1">
                  The User table doesn't exist in the database. Make sure migrations have been applied.
                </p>
              </div>
            )}
            
            {/* Profile Table Schema */}
            {results.schemas?.Profile && Array.isArray(results.schemas.Profile) && (
              <div className="border rounded-sm overflow-hidden">
                <div className="bg-[rgba(var(--mg-panel-dark),0.5)] p-3 border-b border-[rgba(var(--mg-primary),0.2)]">
                  <h3 className="font-medium">Profile Table Schema</h3>
                </div>
                <div className="p-0">
                  <table className="w-full text-sm">
                    <thead className="bg-[rgba(var(--mg-panel-dark),0.3)]">
                      <tr>
                        <th className="p-2 text-left font-medium">Column</th>
                        <th className="p-2 text-left font-medium">Type</th>
                        <th className="p-2 text-left font-medium">Nullable</th>
                        <th className="p-2 text-left font-medium">Default</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.schemas.Profile.map((column: any, i: number) => (
                        <tr key={i} className="border-t border-[rgba(var(--mg-primary),0.1)]">
                          <td className="p-2 font-mono text-xs">{column.column_name}</td>
                          <td className="p-2">{column.data_type}</td>
                          <td className="p-2">{column.is_nullable === 'YES' ? 'Yes' : 'No'}</td>
                          <td className="p-2 font-mono text-xs">{column.column_default || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Table Constraints */}
            {results.constraints && Array.isArray(results.constraints) && (
              <div className="border rounded-sm overflow-hidden">
                <div className="bg-[rgba(var(--mg-panel-dark),0.5)] p-3 border-b border-[rgba(var(--mg-primary),0.2)]">
                  <h3 className="font-medium">Table Constraints</h3>
                </div>
                <div className="p-0">
                  <table className="w-full text-sm">
                    <thead className="bg-[rgba(var(--mg-panel-dark),0.3)]">
                      <tr>
                        <th className="p-2 text-left font-medium">Name</th>
                        <th className="p-2 text-left font-medium">Table</th>
                        <th className="p-2 text-left font-medium">Type</th>
                        <th className="p-2 text-left font-medium">Column</th>
                        <th className="p-2 text-left font-medium">Referenced</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.constraints.map((constraint: any, i: number) => (
                        <tr key={i} className="border-t border-[rgba(var(--mg-primary),0.1)]">
                          <td className="p-2 font-mono text-xs">{constraint.constraint_name}</td>
                          <td className="p-2">{constraint.table_name}</td>
                          <td className="p-2">{constraint.constraint_type}</td>
                          <td className="p-2">{constraint.column_name}</td>
                          <td className="p-2 font-mono text-xs">
                            {constraint.foreign_table_name && constraint.foreign_column_name
                              ? `${constraint.foreign_table_name}.${constraint.foreign_column_name}`
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Schema Recommendations */}
            <div className="border rounded-sm overflow-hidden">
              <div className="bg-[rgba(var(--mg-panel-dark),0.5)] p-3 border-b border-[rgba(var(--mg-primary),0.2)]">
                <h3 className="font-medium">Schema Recommendations</h3>
              </div>
              <div className="p-4">
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  {(!results.tables || results.tables.length === 0) && (
                    <li className="text-[rgba(var(--mg-error),0.8)]">
                      <span className="font-medium">No tables found:</span> Run Prisma migrations to create the database schema
                    </li>
                  )}
                  
                  {(!results.schemas?.User) && (
                    <li className="text-[rgba(var(--mg-error),0.8)]">
                      <span className="font-medium">Missing User table:</span> Run <code>npx prisma migrate dev</code> to create the required tables
                    </li>
                  )}
                  
                  {(!results.migrationTable?.exists) && (
                    <li className="text-[rgba(var(--mg-warning),0.8)]">
                      <span className="font-medium">Missing migration tracking:</span> Your database doesn't have the _prisma_migrations table
                    </li>
                  )}
                  
                  {(results.schemas?.User && (!results.constraints || !results.constraints.some((c: any) => 
                    c.table_name === 'Profile' && c.foreign_table_name === 'User'))) && (
                    <li className="text-[rgba(var(--mg-warning),0.8)]">
                      <span className="font-medium">Missing foreign key constraint:</span> The Profile table should have a foreign key to User
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div className="text-sm mt-6 bg-[rgba(var(--mg-panel-dark),0.3)] p-4 rounded-sm border border-[rgba(var(--mg-primary),0.1)]">
          <p className="font-bold mb-2">Database Schema Setup:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Ensure your <code>DATABASE_URL</code> environment variable is correctly set</li>
            <li>Run <code>npx prisma generate</code> to update your Prisma client</li>
            <li>Run <code>npx prisma migrate dev</code> to create or update your database schema</li>
            <li>If the schema exists but needs to be updated, run <code>npx prisma db push</code></li>
            <li>For existing databases that don't have Prisma migrations, use <code>npx prisma migrate resolve</code></li>
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