// Planned Mission types for the Mission Planner system
// This system allows leaders to plan missions with scenarios (Full Ops / Skeleton Crew)
// and creates Discord events for RSVP tracking

import { ActivityType, OperationType } from './MissionTemplate';
import { ShipDetails } from './ShipData';

// Ship assignment for a scenario (references ship compendium)
export interface ScenarioShip {
  shipName: string;           // Ship name from compendium
  manufacturer: string;       // Ship manufacturer
  size: string;               // Ship size category
  role?: string[];            // Ship roles
  image: string;              // Ship image URL
  quantity: number;           // How many of this ship
  notes?: string;             // Optional notes (e.g., "Lead ship", "Backup")
}

// Mission scenario (Full Ops or Skeleton Crew)
export interface MissionScenario {
  id: string;                 // Unique ID for the scenario
  name: string;               // e.g., "Full Ops", "Skeleton Crew", "Minimum Viable"
  description?: string;       // Description of this scenario
  ships: ScenarioShip[];      // Ships assigned to this scenario
  estimatedCrew: number;      // Estimated number of crew needed
  notes?: string;             // Additional notes for this scenario
}

// Leader assignment for a mission
export interface MissionLeader {
  userId: string;             // User ID from the system
  aydoHandle: string;         // Display name
  role: string;               // Leadership role (e.g., "Mission Commander", "Ground Lead", "Air Lead")
  discordId?: string;         // Discord ID for mentions
}

// Reference image for mission briefing
export interface MissionImage {
  id: string;
  url: string;
  caption?: string;
  uploadedBy: string;
  uploadedAt: string;
}

// Discord event reference
export interface DiscordEventReference {
  eventId: string;            // Discord event ID
  guildId: string;            // Discord guild/server ID
  createdAt: string;          // When the event was created
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

// Main Planned Mission interface
export interface PlannedMission {
  id: string;

  // Basic Information
  name: string;
  scheduledDateTime: string;  // ISO date string
  duration?: number;          // Duration in minutes (optional)
  location?: string;          // In-game location/system

  // Template Reference (optional)
  templateId?: string;        // If created from a template
  templateName?: string;      // Cached template name

  // Operation Details
  operationType: OperationType;
  primaryActivity: ActivityType;
  secondaryActivity?: ActivityType;
  tertiaryActivity?: ActivityType;

  // Leadership
  leaders: MissionLeader[];

  // Scenario Planning
  scenarios: MissionScenario[];
  activeScenarioId?: string;  // Currently active scenario (set based on turnout)

  // Mission Brief
  objectives: string;         // Mission objectives
  briefing: string;           // Full mission briefing/strategy
  equipmentNotes?: string;    // Equipment recommendations
  images: MissionImage[];     // Reference images/diagrams

  // Discord Integration
  discordEvent?: DiscordEventReference;

  // Status
  status: PlannedMissionStatus;

  // Metadata
  createdBy: string;          // User ID
  createdAt: string;          // ISO date string
  updatedAt: string;          // ISO date string
}

// Mission status lifecycle
export type PlannedMissionStatus =
  | 'DRAFT'           // Being created/edited
  | 'SCHEDULED'       // Published, waiting for event
  | 'ACTIVE'          // Mission in progress
  | 'COMPLETED'       // Mission finished successfully
  | 'CANCELLED';      // Mission cancelled

// Response interface with populated data
export interface PlannedMissionResponse extends PlannedMission {
  creatorName?: string;
}

// Form validation errors
export interface PlannedMissionValidationErrors {
  name?: string;
  scheduledDateTime?: string;
  operationType?: string;
  primaryActivity?: string;
  leaders?: string;
  scenarios?: string;
  objectives?: string;
  briefing?: string;
  general?: string;
}

// Leadership role options
export const LEADERSHIP_ROLES = [
  'Mission Commander',
  'Ground Lead',
  'Air Lead',
  'Fleet Commander',
  'Logistics Lead',
  'Security Lead',
  'Medical Lead',
  'Mining Lead',
  'Salvage Lead',
  'Transport Lead'
] as const;

export type LeadershipRole = typeof LEADERSHIP_ROLES[number];

// Default scenario templates
export const DEFAULT_SCENARIO_NAMES = [
  'Full Ops',
  'Skeleton Crew',
  'Minimum Viable'
] as const;

// Helper to create a new empty scenario
export function createEmptyScenario(name: string = 'New Scenario'): MissionScenario {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    ships: [],
    estimatedCrew: 0,
    notes: ''
  };
}

// Helper to create default scenarios
export function createDefaultScenarios(): MissionScenario[] {
  return [
    {
      id: crypto.randomUUID ? crypto.randomUUID() : `scenario-fullops-${Date.now()}`,
      name: 'Full Ops',
      description: 'Ideal scenario with full crew and optimal ship complement',
      ships: [],
      estimatedCrew: 0,
      notes: ''
    },
    {
      id: crypto.randomUUID ? crypto.randomUUID() : `scenario-skeleton-${Date.now()}`,
      name: 'Skeleton Crew',
      description: 'Minimum viable scenario for low turnout',
      ships: [],
      estimatedCrew: 0,
      notes: ''
    }
  ];
}

// Helper to convert ShipDetails to ScenarioShip
export function shipDetailsToScenarioShip(ship: ShipDetails, quantity: number = 1): ScenarioShip {
  return {
    shipName: ship.name,
    manufacturer: ship.manufacturer,
    size: ship.size || 'Medium',
    role: ship.role,
    image: ship.image,
    quantity,
    notes: ''
  };
}
