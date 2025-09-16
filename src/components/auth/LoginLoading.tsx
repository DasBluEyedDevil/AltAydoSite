'use client';

import { bgUrl } from '@/lib/cdn';

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-opacity-80 bg-cover bg-center bg-blend-overlay" style={{ backgroundImage: bgUrl('/spacebg.jpg') }}>
      <div className="mg-loading-spinner">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 border border-[rgba(var(--mg-primary),0.2)] rounded-sm"></div>
            <div className="absolute inset-0 border-t-2 border-l-2 border-[rgba(var(--mg-primary),0.8)] rounded-sm animate-spin"></div>
          </div>
          <div className="mt-4 font-quantify tracking-wider text-xs">ACCESSING SYSTEM</div>
        </div>
      </div>
    </div>
  );
}