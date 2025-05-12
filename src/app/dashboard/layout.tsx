import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AydoCorp | Command Center',
  description: 'Access your AydoCorp organization dashboard and resources.'
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 