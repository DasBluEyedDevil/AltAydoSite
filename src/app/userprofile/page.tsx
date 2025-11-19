'use client';

import { notFound } from 'next/navigation';
import UserProfileContent from '@/components/profile/UserProfileContent';

export default function UserProfilePage() {
  // Block access in production - use /dashboard/profile instead
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return <UserProfileContent />;
} 