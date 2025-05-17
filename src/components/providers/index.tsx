'use client';

import { ReactNode } from 'react';
import AuthProvider from '../AuthProvider';
import AmplifyProvider from './AmplifyProvider';

// This component wraps all providers needed for the application
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AmplifyProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </AmplifyProvider>
  );
} 