'use client';

import React, { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import LoginLoading from '@/components/auth/LoginLoading';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
} 
