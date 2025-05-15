'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AwsAuthPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Making request to /api/db-test/aws-auth...");
      const response = await fetch('/api/db-test/aws-auth');
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
      console.error("Error running AWS auth test:", err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-[rgba(var(--mg-panel),0.8)] backdrop-blur-md p-6 rounded-sm relative">
        <h1 className="mg-title text-xl mb-2 text-center">AWS IAM Authentication Diagnostic</h1>
        <p className="text-center text-sm mb-6 text-[rgba(var(--mg-text),0.7)]">
          This test checks if your environment is properly set up for AWS IAM database authentication
        </p>
        
        <div className="mb-6">
          <button 
            onClick={runTest}
            disabled={loading}
            className="mg-button w-full py-2 px-4 relative overflow-hidden"
          >
            {loading ? 'Testing AWS IAM Auth...' : 'Run AWS IAM Auth Test'}
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
              <p className="font-medium">IAM Auth Test: {results.success ? 'Completed' : 'Failed'}</p>
              <p className="text-sm">{results.message}</p>
              <p className="text-xs mt-1 text-[rgba(var(--mg-text),0.6)]">{results.timestamp}</p>
            </div>
            
            {/* Environment Variables */}
            {results.info?.env && (
              <div className="border rounded-sm overflow-hidden">
                <div className="bg-[rgba(var(--mg-panel-dark),0.5)] p-3 border-b border-[rgba(var(--mg-primary),0.2)]">
                  <h3 className="font-medium">Environment Variables</h3>
                </div>
                <div className="p-4">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-[rgba(var(--mg-primary),0.1)]">
                        <td className="py-2 pr-4 font-medium">DATABASE_URL</td>
                        <td className={`py-2 ${results.info.env.database_url_present ? 'text-[rgba(var(--mg-success),0.8)]' : 'text-[rgba(var(--mg-error),0.8)]'}`}>
                          {results.info.env.database_url_present ? 'Present' : 'Missing'}
                        </td>
                      </tr>
                      <tr className="border-b border-[rgba(var(--mg-primary),0.1)]">
                        <td className="py-2 pr-4 font-medium">Format</td>
                        <td className="py-2 font-mono text-xs break-all">
                          {results.info.env.database_url_format}
                        </td>
                      </tr>
                      <tr className="border-b border-[rgba(var(--mg-primary),0.1)]">
                        <td className="py-2 pr-4 font-medium">aws_auth parameter</td>
                        <td className={`py-2 ${results.info.env.aws_auth ? 'text-[rgba(var(--mg-success),0.8)]' : 'text-[rgba(var(--mg-error),0.8)]'}`}>
                          {results.info.env.aws_auth ? 'Present' : 'Missing'}
                        </td>
                      </tr>
                      <tr className="border-b border-[rgba(var(--mg-primary),0.1)]">
                        <td className="py-2 pr-4 font-medium">NEXTAUTH_URL</td>
                        <td className={`py-2 ${results.info.env.nextauth_url_present ? 'text-[rgba(var(--mg-success),0.8)]' : 'text-[rgba(var(--mg-warning),0.8)]'}`}>
                          {results.info.env.nextauth_url_present ? 'Present' : 'Missing'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-medium">NEXTAUTH_SECRET</td>
                        <td className={`py-2 ${results.info.env.nextauth_secret_present ? 'text-[rgba(var(--mg-success),0.8)]' : 'text-[rgba(var(--mg-warning),0.8)]'}`}>
                          {results.info.env.nextauth_secret_present ? 'Present' : 'Missing or too short'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* AWS Info */}
            {results.info?.aws && (
              <div className="border rounded-sm overflow-hidden">
                <div className="bg-[rgba(var(--mg-panel-dark),0.5)] p-3 border-b border-[rgba(var(--mg-primary),0.2)]">
                  <h3 className="font-medium">AWS Configuration</h3>
                </div>
                <div className="p-4">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-[rgba(var(--mg-primary),0.1)]">
                        <td className="py-2 pr-4 font-medium">AWS Region</td>
                        <td className={`py-2 ${results.info.aws.region_set ? 'text-[rgba(var(--mg-success),0.8)]' : 'text-[rgba(var(--mg-warning),0.8)]'}`}>
                          {results.info.aws.region_set ? 'Set' : 'Not set'}
                        </td>
                      </tr>
                      <tr className="border-b border-[rgba(var(--mg-primary),0.1)]">
                        <td className="py-2 pr-4 font-medium">AWS Credentials</td>
                        <td className="py-2">
                          {results.info.aws.credentials_available === true ? 
                            <span className="text-[rgba(var(--mg-success),0.8)]">Available</span> : 
                            <span className="text-[rgba(var(--mg-warning),0.8)]">{results.info.aws.credentials_available}</span>}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-medium">Identity</td>
                        <td className="py-2">
                          {results.info.aws.identity_available === true ? 
                            <span className="text-[rgba(var(--mg-success),0.8)]">Available</span> : 
                            <span className="text-[rgba(var(--mg-warning),0.8)]">{results.info.aws.identity_available}</span>}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Recommendations */}
            <div className="border rounded-sm overflow-hidden">
              <div className="bg-[rgba(var(--mg-panel-dark),0.5)] p-3 border-b border-[rgba(var(--mg-primary),0.2)]">
                <h3 className="font-medium">Recommendations</h3>
              </div>
              <div className="p-4">
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {!results.info?.env.database_url_present && (
                    <li className="text-[rgba(var(--mg-error),0.8)]">
                      DATABASE_URL environment variable is missing
                    </li>
                  )}
                  {results.info?.env.database_url_present && !results.info?.env.aws_auth && (
                    <li className="text-[rgba(var(--mg-error),0.8)]">
                      Add <code>aws_auth=true</code> parameter to your DATABASE_URL
                    </li>
                  )}
                  {results.info?.aws.credentials_available !== true && (
                    <li className="text-[rgba(var(--mg-warning),0.8)]">
                      No AWS credentials found - ensure your Amplify app has an IAM role with RDS access
                    </li>
                  )}
                  <li>
                    Verify that IAM authentication is enabled on your RDS instance
                  </li>
                  <li>
                    Make sure your IAM role has the <code>rds-db:connect</code> permission
                  </li>
                  <li>
                    Create the database user with <code>aws_default_iam_role=</code> attribute
                  </li>
                </ul>
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