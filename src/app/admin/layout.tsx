import React from 'react';
import { Metadata } from 'next';
import DashboardClient from '../dashboard/DashboardClient';

export const metadata: Metadata = {
  title: 'AydoCorp | Admin Console',
  description: 'Administrative controls for AydoCorp organization management.'
};

export default function AdminLayout({
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