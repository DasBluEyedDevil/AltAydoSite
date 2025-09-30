// Mission Template types following AydoCorp patterns

// Activity types that can be selected for missions
export type ActivityType = 'Mining' | 'Salvage' | 'Escort' | 'Transport' | 'Medical' | 'Combat';

// Operation types (Ground vs Space)
export type OperationType = 'Ground Operations' | 'Space Operations';

// Ship size categories
export type ShipSize = 'Small' | 'Medium' | 'Large' | 'Capital';

// Ship categories
export type ShipCategory = 'Fighter' | 'Transport' | 'Industrial' | 'Medical';

// Personnel professions
export type PersonnelProfession = 'Pilot' | 'Gunner' | 'Medic' | 'Infantry' | 'Engineer';

// Ship roster entry
export interface MissionTemplateShip {
  size: ShipSize;
  category: ShipCategory;
  count: number;
}

// Personnel roster entry
export interface MissionTemplatePersonnel {
  profession: PersonnelProfession;
  count: number;
}

// Main Mission Template interface
export interface MissionTemplate {
  id: string;
  name: string;
  operationType: OperationType;

  // Activity selections (primary is required, secondary/tertiary optional)
  primaryActivity: ActivityType;
  secondaryActivity?: ActivityType;
  tertiaryActivity?: ActivityType;

  // Dynamic rosters
  shipRoster: MissionTemplateShip[];
  personnelRoster: MissionTemplatePersonnel[];

  // Required equipment (free-form text)
  requiredEquipment: string;

  // Metadata
  createdBy: string; // User ID of template creator
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Response interface (extends base interface)
export interface MissionTemplateResponse extends MissionTemplate {
  creatorName?: string; // Optional populated creator name
}

// Form validation error interface
export interface MissionTemplateValidationErrors {
  name?: string;
  primaryActivity?: string;
  shipRoster?: string;
  personnelRoster?: string;
  requiredEquipment?: string;
  general?: string;
}