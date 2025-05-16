'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Import the server error boundary with dynamic import to ensure it only loads on the client
const ServerErrorBoundary = dynamic(
  () => import('./ServerErrorBoundary'),
  { ssr: false }
);

export default function ClientErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ServerErrorBoundary>{children}</ServerErrorBoundary>;
}