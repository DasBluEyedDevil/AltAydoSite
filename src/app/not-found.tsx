import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-6 text-[rgba(var(--mg-primary),1)]">404 - Page Not Found</h1>
        <p className="text-lg mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mb-8 p-6 border border-[rgba(var(--mg-primary),0.3)] rounded-lg bg-black/30">
          <p className="text-sm opacity-80 mb-4">
            SYSTEM LOG: Navigation error detected. Coordinates invalid or restricted.
          </p>
          <p className="text-sm opacity-80">
            Recommended action: Return to known coordinates or contact AydoCorp Navigation Support.
          </p>
        </div>
        <Link 
          href="/" 
          className="inline-block px-6 py-3 bg-[rgba(var(--mg-primary),0.2)] hover:bg-[rgba(var(--mg-primary),0.3)] border border-[rgba(var(--mg-primary),0.5)] rounded-md transition-all duration-300"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}