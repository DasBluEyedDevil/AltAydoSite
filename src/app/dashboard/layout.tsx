import React from 'react';
import { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'AydoCorp | Employee Portal',
  description: 'Access your AydoCorp organization dashboard and resources.'
};

export default function DashboardLayout({
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