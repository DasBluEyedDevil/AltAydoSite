import { getDirectImagePath, getShipByName } from '@/types/ShipData';

/**
 * Resolve a displayable image URL for a given ship model/name.
 * Falls back to a neutral placeholder when unknown.
 */
export function resolveShipImage(model: string): string {
  if (!model) return getShipPlaceholder();
  try {
    // Prefer direct mapping
    const direct = getDirectImagePath(model);
    if (direct && direct.trim().length > 0) {
      return direct;
    }
    // Try by canonical ship details (some models/types differ)
    const details = getShipByName(model);
    if (details?.image) return details.image;
  } catch {
    // ignore
  }
  return getShipPlaceholder();
}

export function getShipPlaceholder(): string {
  return '/assets/ship-placeholder.png';
}
