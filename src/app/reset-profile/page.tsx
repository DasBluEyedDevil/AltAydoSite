'use client';

import { notFound } from 'next/navigation';
import ResetProfile from '@/app/reset-profile';

export default function ResetProfilePage() {
  // Block access in production
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return <ResetProfile />;
} 