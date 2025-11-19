'use client';

import { notFound } from 'next/navigation';
import ResetProfileComponent from '@/components/profile/ResetProfileComponent';

export default function ResetProfilePage() {
  // Block access in production
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return <ResetProfileComponent />;
}