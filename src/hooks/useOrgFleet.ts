'use client';

import { useState, useEffect, useRef } from 'react';
import type { ShipDocument } from '@/types/ship';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single category with its total count and per-ship breakdown */
export interface CategoryCount {
  name: string;
  count: number;
  ships: { name: string; count: number }[];
}

/** Aggregated fleet data across three axes: classification, manufacturer, size */
export interface FleetAggregation {
  byClassification: CategoryCount[];
  byManufacturer: CategoryCount[];
  bySize: CategoryCount[];
  totalShips: number;
  totalMembers: number;
  shipDetails: Map<string, { ship: ShipDocument; count: number }>;
}

/** Return type of the useOrgFleet hook */
export interface UseOrgFleetReturn {
  data: FleetAggregation | null;
  isLoading: boolean;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum number of IDs per batch request (matches /api/ships/batch Zod limit) */
const BATCH_SIZE = 50;

/** Page size for user fetching */
const USER_PAGE_SIZE = 200;

// ---------------------------------------------------------------------------
// Types for API responses
// ---------------------------------------------------------------------------

interface UserListItem {
  id: string;
  aydoHandle: string;
  role: string;
  division: string | null;
  position: string | null;
  ships: { manufacturer: string; name: string; fleetyardsId: string; image?: string }[];
}

interface UsersPageResponse {
  items: UserListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Fetch all org members, collect their ships, batch-resolve to ShipDocuments,
 * and produce aggregated fleet statistics.
 *
 * Aggregates across three axes:
 * - byClassification: grouped by ship classification label
 * - byManufacturer: grouped by manufacturer name
 * - bySize: grouped by ship size category
 *
 * Each axis is sorted by count descending with per-ship drill-down.
 */
export function useOrgFleet(): UseOrgFleetReturn {
  const [data, setData] = useState<FleetAggregation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    async function fetchOrgFleet() {
      setIsLoading(true);
      setError(null);

      try {
        // ------------------------------------------------------------------
        // Step 1: Fetch all users (paginated)
        // ------------------------------------------------------------------
        const allUsers: UserListItem[] = [];
        let currentPage = 1;
        let totalPages = 1;

        while (currentPage <= totalPages) {
          const params = new URLSearchParams({
            page: String(currentPage),
            pageSize: String(USER_PAGE_SIZE),
          });

          const response = await fetch(`/api/users?${params.toString()}`, {
            signal: controller.signal,
          });

          if (!response.ok) {
            const body = await response.json().catch(() => null);
            throw new Error(
              body?.error || `Failed to fetch users (${response.status})`
            );
          }

          const result: UsersPageResponse = await response.json();
          allUsers.push(...result.items);
          totalPages = result.totalPages;
          currentPage++;
        }

        // ------------------------------------------------------------------
        // Step 2: Collect unique fleetyardsIds from all users' ships
        // ------------------------------------------------------------------
        const idSet = new Set<string>();
        for (const user of allUsers) {
          if (user.ships) {
            for (const ship of user.ships) {
              if (ship.fleetyardsId && ship.fleetyardsId.trim().length > 0) {
                idSet.add(ship.fleetyardsId);
              }
            }
          }
        }

        const uniqueIds = Array.from(idSet);

        // ------------------------------------------------------------------
        // Step 3: Batch-resolve ship details
        // ------------------------------------------------------------------
        const shipMap = new Map<string, ShipDocument>();

        if (uniqueIds.length > 0) {
          // Chunk into batches of BATCH_SIZE
          const chunks: string[][] = [];
          for (let i = 0; i < uniqueIds.length; i += BATCH_SIZE) {
            chunks.push(uniqueIds.slice(i, i + BATCH_SIZE));
          }

          for (const chunk of chunks) {
            const response = await fetch('/api/ships/batch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids: chunk }),
              signal: controller.signal,
            });

            if (!response.ok) {
              const body = await response.json().catch(() => null);
              throw new Error(
                body?.error || `Failed to fetch ships batch (${response.status})`
              );
            }

            const result: { items: ShipDocument[] } = await response.json();
            for (const ship of result.items) {
              shipMap.set(ship.fleetyardsId, ship);
            }
          }
        }

        // ------------------------------------------------------------------
        // Step 4: Aggregate fleet data
        // ------------------------------------------------------------------
        const classificationMap = new Map<string, Map<string, number>>();
        const manufacturerMap = new Map<string, Map<string, number>>();
        const sizeMap = new Map<string, Map<string, number>>();
        const shipDetails = new Map<string, { ship: ShipDocument; count: number }>();
        let totalShips = 0;

        for (const user of allUsers) {
          if (!user.ships) continue;

          for (const userShip of user.ships) {
            const resolved = shipMap.get(userShip.fleetyardsId);
            if (!resolved) continue;

            totalShips++;

            // Track individual ship counts
            const existing = shipDetails.get(resolved.fleetyardsId);
            if (existing) {
              existing.count++;
            } else {
              shipDetails.set(resolved.fleetyardsId, { ship: resolved, count: 1 });
            }

            // Aggregate by classification
            const classification = resolved.classificationLabel || 'Unclassified';
            if (!classificationMap.has(classification)) {
              classificationMap.set(classification, new Map());
            }
            const classShips = classificationMap.get(classification)!;
            classShips.set(resolved.name, (classShips.get(resolved.name) || 0) + 1);

            // Aggregate by manufacturer
            const manufacturer = resolved.manufacturer.name;
            if (!manufacturerMap.has(manufacturer)) {
              manufacturerMap.set(manufacturer, new Map());
            }
            const mfgShips = manufacturerMap.get(manufacturer)!;
            mfgShips.set(resolved.name, (mfgShips.get(resolved.name) || 0) + 1);

            // Aggregate by size
            const size = resolved.size || 'Unknown';
            if (!sizeMap.has(size)) {
              sizeMap.set(size, new Map());
            }
            const sizeShips = sizeMap.get(size)!;
            sizeShips.set(resolved.name, (sizeShips.get(resolved.name) || 0) + 1);
          }
        }

        // Convert aggregation maps to sorted CategoryCount arrays
        const byClassification = mapToCategoryCount(classificationMap);
        const byManufacturer = mapToCategoryCount(manufacturerMap);
        const bySize = mapToCategoryCount(sizeMap);

        setData({
          byClassification,
          byManufacturer,
          bySize,
          totalShips,
          totalMembers: allUsers.length,
          shipDetails,
        });
        setError(null);
      } catch (err: unknown) {
        // Don't update state if this request was aborted
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        const message =
          err instanceof Error ? err.message : 'Failed to fetch org fleet data';
        setError(message);
      } finally {
        // Only update loading if this controller is still current
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchOrgFleet();

    return () => {
      controller.abort();
    };
  }, []);

  return { data, isLoading, error };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a Map<categoryName, Map<shipName, count>> to a sorted CategoryCount[].
 * Categories are sorted by total count descending. Ships within each category
 * are also sorted by count descending.
 */
function mapToCategoryCount(
  map: Map<string, Map<string, number>>,
): CategoryCount[] {
  const categories: CategoryCount[] = [];

  for (const [name, shipsMap] of map) {
    const ships: { name: string; count: number }[] = [];
    let totalCount = 0;

    for (const [shipName, count] of shipsMap) {
      ships.push({ name: shipName, count });
      totalCount += count;
    }

    // Sort ships within category by count descending
    ships.sort((a, b) => b.count - a.count);

    categories.push({ name, count: totalCount, ships });
  }

  // Sort categories by count descending
  categories.sort((a, b) => b.count - a.count);

  return categories;
}
