import React from 'react';
import { Metadata } from 'next';
import DashboardClient from '../dashboard/DashboardClient';

export const metadata: Metadata = {
  title: 'AydoCorp | User Profile',
  description: 'Manage your AydoCorp profile and account settings.'
};

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardClient>
      {children}
    </DashboardClient>
  );
} 