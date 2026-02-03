import { ShipDetails, _populateShipDatabaseCache, getShipImagePath } from '@/types/ShipData';

let shipCache: ShipDetails[] | null = null;

export async function loadShipDatabase(): Promise<ShipDetails[]> {
  if (shipCache) return shipCache;

  try {
    const response = await fetch('/data/ships.json');
    if (!response.ok) {
      throw new Error(`Failed to load ship database: ${response.status}`);
    }
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
  } catch (error) {
    console.error('Failed to load ship database:', error);
    return [];
  }
}

export function getShipDatabaseSync(): ShipDetails[] | null {
  return shipCache;
}

export function isShipDatabaseLoaded(): boolean {
  return shipCache !== null;
}

export function clearShipCache(): void {
  shipCache = null;
  _populateShipDatabaseCache([]);
}
