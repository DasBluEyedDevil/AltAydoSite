'use client';

import React from 'react';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { formatRelativeTime } from '@/lib/ships/format';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Subtle footer indicator showing the last ship data sync time.
 *
 * Self-contained: fetches sync status via the useSyncStatus hook.
 * Renders a small coloured dot (green/yellow/red) based on the
 * latest sync outcome, plus a relative timestamp like "2 hours ago".
 * Returns null while loading or if no data is available.
 */
export default function SyncStatusIndicator() {
  const { syncStatus, isLoading } = useSyncStatus();

  // Don't render anything while loading or if no sync data exists
  if (isLoading || !syncStatus || !syncStatus.lastSyncAt) {
    return null;
  }

  // Map sync status string to a dot colour
  const dotColorMap: Record<string, string> = {
    success: 'bg-[rgba(var(--mg-success),0.8)]',
    partial: 'bg-[rgba(var(--mg-warning),0.8)]',
    failed: 'bg-[rgba(var(--mg-danger),0.8)]',
  };

  const dotColor = dotColorMap[syncStatus.status] ?? 'bg-[rgba(var(--mg-text),0.4)]';

  return (
    <div className="flex items-center gap-1.5 text-[rgba(var(--mg-text),0.4)] text-xs">
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${dotColor}`} />
      <span>Last synced: {formatRelativeTime(syncStatus.lastSyncAt)}</span>
    </div>
  );
}
