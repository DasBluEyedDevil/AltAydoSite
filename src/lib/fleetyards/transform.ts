/**
 * FleetYards-to-ShipDocument Transform
 *
 * Maps a validated FleetYards API response object into our internal
 * ShipDocument shape. This function is the clean boundary between external
 * API data and internal storage format.
 *
 * Input:  ValidatedFleetYardsShip (Zod-validated, defaults applied)
 * Output: ShipDocument without _id and createdAt (set by MongoDB upsert)
 */

import type { ValidatedFleetYardsShip, ShipDocument } from '@/types/ship';

// ---------------------------------------------------------------------------
// Image URL Extraction Helper
// ---------------------------------------------------------------------------

/**
 * Safely extracts an image URL from a view object at the requested resolution.
 *
 * FleetYards view objects contain multiple resolutions (source, small, medium, large).
 * This helper handles null/undefined views gracefully.
 *
 * @param view - The image view object (may be null or undefined)
 * @param size - The resolution to extract: 'source' or 'medium'
 * @returns The URL string, or null if not available
 */
export function extractImageUrl(
  view: { source?: string; medium?: string } | null | undefined,
  size: 'source' | 'medium' = 'source',
): string | null {
  if (!view) return null;
  const url = view[size];
  return url && url.length > 0 ? url : null;
}

// ---------------------------------------------------------------------------
// Main Transform
// ---------------------------------------------------------------------------

/**
 * Transforms a validated FleetYards API ship into our internal ShipDocument shape.
 *
 * Field mapping is explicit and one-to-one -- no spread operators on raw API data.
 * Every field is mapped individually for full visibility and type safety.
 *
 * Note: `_id` and `createdAt` are intentionally omitted from the return type.
 * - `_id` is assigned by MongoDB on insert
 * - `createdAt` is set via `$setOnInsert` in the upsert operation (Plan 03)
 *   so it is only written on first insert, never overwritten on update
 *
 * @param raw - A Zod-validated FleetYards ship object (defaults already applied)
 * @param syncVersion - The current sync run version number
 * @returns A ShipDocument-shaped object ready for MongoDB upsert
 */
export function transformFleetYardsShip(
  raw: ValidatedFleetYardsShip,
  syncVersion: number,
): Omit<ShipDocument, '_id' | 'createdAt'> {
  return {
    // Identity
    fleetyardsId: raw.id,
    slug: raw.slug,
    name: raw.name,
    scIdentifier: raw.scIdentifier ?? null,

    // Manufacturer (simplified from API -- longName dropped)
    manufacturer: {
      name: raw.manufacturer.name,
      code: raw.manufacturer.code,
      slug: raw.manufacturer.slug,
    },

    // Classification and status
    classification: raw.classification ?? '',
    classificationLabel: raw.classificationLabel ?? '',
    focus: raw.focus ?? '',
    size: raw.size ?? '',
    productionStatus: raw.productionStatus ?? '',

    // Crew
    crew: {
      min: raw.crew?.min ?? 0,
      max: raw.crew?.max ?? 0,
    },

    // Physical attributes
    cargo: raw.cargo ?? 0,
    length: raw.length ?? 0,
    beam: raw.beam ?? 0,
    height: raw.height ?? 0,
    mass: raw.mass ?? 0,

    // Performance
    scmSpeed: raw.scmSpeed ?? null,
    hydrogenFuelTankSize: raw.hydrogenFuelTankSize ?? null,
    quantumFuelTankSize: raw.quantumFuelTankSize ?? null,

    // Pricing
    pledgePrice: raw.pledgePrice ?? null,
    price: raw.price ?? null,

    // Content
    description: raw.description ?? null,
    storeUrl: raw.storeUrl ?? null,

    // Images -- extracted from view objects at source and medium resolutions
    images: {
      store: raw.storeImage ?? null,
      angledView: extractImageUrl(raw.angledView, 'source'),
      angledViewMedium: extractImageUrl(raw.angledView, 'medium'),
      sideView: extractImageUrl(raw.sideView, 'source'),
      sideViewMedium: extractImageUrl(raw.sideView, 'medium'),
      topView: extractImageUrl(raw.topView, 'source'),
      topViewMedium: extractImageUrl(raw.topView, 'medium'),
      frontView: extractImageUrl(raw.frontView, 'source'),
      frontViewMedium: extractImageUrl(raw.frontView, 'medium'),
      fleetchartImage: raw.fleetchartImage ?? null,
    },

    // Sync metadata
    syncedAt: new Date(),
    syncVersion,
    fleetyardsUpdatedAt: raw.updatedAt ?? raw.lastUpdatedAt ?? '',
    updatedAt: new Date(),
  };
}
