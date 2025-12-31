import { ShipDetails, _populateShipDatabaseCache, getShipImagePath } from '@/types/ShipData';

let shipCache: ShipDetails[] | null = null;

export async function loadShipDatabase(): Promise<ShipDetails[]> {
  if (shipCache) return shipCache;
  const response = await fetch('/data/ships.json');
  const rawShips = await response.json();
  // Add image paths to ships loaded from JSON
  const ships: ShipDetails[] = rawShips.map((ship: Omit<ShipDetails, 'image'> & { image?: string }) => ({
    ...ship,
    image: ship.image || getShipImagePath(ship.name)
  }));
  shipCache = ships;
  // Populate the deprecated shipDatabase cache for backward compatibility
  _populateShipDatabaseCache(ships);
  return ships;
}

export function getShipDatabaseSync(): ShipDetails[] | null {
  return shipCache;
}

export function clearShipCache(): void {
  shipCache = null;
  _populateShipDatabaseCache([]);
}
