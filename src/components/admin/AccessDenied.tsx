import React from 'react';
import Link from 'next/link';

export default function AccessDenied() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center p-8 border border-[rgba(var(--mg-primary),0.3)] backdrop-blur-sm bg-black/30 rounded">
        <h2 className="text-xl text-[rgba(var(--mg-primary),1)]">Access Restricted</h2>
        <p className="opacity-70 mt-2">You do not have permission to access the admin dashboard</p>
        <Link href="/dashboard" className="mt-4 inline-block px-4 py-2 bg-[rgba(var(--mg-primary),0.2)] hover:bg-[rgba(var(--mg-primary),0.3)] text-[rgba(var(--mg-primary),0.9)] rounded transition-colors">
          Return to Employee Portal
        </Link>
      </div>
    </div>
  );
}