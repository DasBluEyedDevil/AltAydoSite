import { resolveShipImage } from '@/lib/ships/image';
import type { ShipDocument } from '@/types/ship';
import type { UserShip } from '@/types/user';
import type { MissionShip } from '@/types/PlannedMission';

// ---------------------------------------------------------------------------
// ShipDocument -> UserShip Mapper
// ---------------------------------------------------------------------------

/**
 * Convert a ShipDocument (from the ship database) to a UserShip (for user
 * profile ship lists).
 *
 * Addresses Pitfall 4 (UserShip type mismatch) from research -- ensures
 * the image field is populated from the ship database images rather than
 * relying on legacy static image paths.
 */
export function shipDocumentToUserShip(ship: ShipDocument): UserShip {
  return {
    manufacturer: ship.manufacturer.name,
    name: ship.name,
    fleetyardsId: ship.fleetyardsId,
    image: resolveShipImage(ship.images, 'store'),
  };
}

// ---------------------------------------------------------------------------
// ShipDocument -> MissionShip Mapper
// ---------------------------------------------------------------------------

/**
 * Convert a ShipDocument (from the ship database) to a MissionShip (for
 * mission planning ship rosters).
 *
 * Addresses Pitfall 5 (empty fleetyardsId placeholder) from research --
 * populates fleetyardsId directly from the resolved ShipDocument rather
 * than leaving it as an empty string.
 */
export function shipDocumentToMissionShip(
  ship: ShipDocument,
  quantity?: number,
): MissionShip {
  return {
    shipName: ship.name,
    manufacturer: ship.manufacturer.name,
    size: ship.size || 'medium',
    role: ship.classificationLabel ? [ship.classificationLabel] : [],
    fleetyardsId: ship.fleetyardsId,
    image: resolveShipImage(ship.images, 'store'),
    quantity: quantity ?? 1,
    notes: '',
  };
}
