import { notFound } from 'next/navigation';

export default function MissionsRemovedPage() {
  // Mission Planner has been removed. Return 404 so the route is no longer accessible.
  return notFound();
}
