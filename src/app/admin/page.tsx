import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/auth';
import AdminDashboardContent from '@/components/admin/AdminDashboardContent';
import AccessDenied from '@/components/admin/AccessDenied';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  // Check if user is logged in
  if (!session) {
    redirect('/login');
  }

  // TODO: Implement proper role check via NextAuth when integrated
  // For now, we'll use a placeholder check
  const isAdmin = session.user?.email === "shatteredobsidian@yahoo.com";

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return <AdminDashboardContent />;
} 
