// Planned Mission types for the Mission Planner system
//
// WORKFLOW:
// 1. User creates reusable templates (ship sizes/counts, activities, equipment)
// 2. User creates mission plan by selecting a template, then specifying:
//    - Actual specific ships (Carrack, Pisces, etc.)
//    - Leader assignments
//    - Date/time and mission details
// 3. Mission is published to Discord as an event
// 4. Expected participants auto-sync from Discord RSVPs
// 5. Post-mission: Leaders mark confirmed participants (attendance tracking)

import { ActivityType, OperationType } from './MissionTemplate';
import { ShipDetails } from './ShipData';

// Actual ship assignment (specific ship from compendium)
export interface MissionShip {
  shipName: string;           // Specific ship name (e.g., "Carrack", "Pisces C8X")
  manufacturer: string;       // Ship manufacturer
  size: string;               // Ship size category
  role?: string[];            // Ship roles
  image: string;              // Ship image URL
  quantity: number;           // How many of this ship type
  assignedTo?: string;        // Optional: User ID of who's bringing this ship
  assignedToName?: string;    // Optional: Display name of assignee
  notes?: string;             // Optional notes (e.g., "Lead ship", "Medical support")
}

// Leader assignment for a mission
export interface MissionLeader {
  userId: string;             // User ID from the system
  aydoHandle: string;         // Display name
  role: string;               // Leadership role (e.g., "Mission Commander", "Ground Lead")
  discordId?: string;         // Discord ID for mentions
}

// Participant from Discord RSVP (expected to attend)
export interface ExpectedParticipant {
  discordId: string;          // Discord user ID
  discordUsername: string;    // Discord username
  discordGlobalName?: string; // Discord display name
  discordNickname?: string;   // Server nickname
  discordAvatar?: string;     // Avatar URL
  userId?: string;            // Linked AydoDB user ID (if matched)
  aydoHandle?: string;        // Linked AydoDB handle (if matched)
  rsvpAt?: string;            // When they RSVP'd (ISO date)
}

// Confirmed participant (actually showed up)
export interface ConfirmedParticipant {
  odId: string;            // Discord or User ID
  displayName: string;        // Display name used
  discordId?: string;         // Discord ID if from Discord
  userId?: string;            // AydoDB user ID if linked
  aydoHandle?: string;        // AydoDB handle if linked
  role?: string;              // Role they played in the mission
  confirmedBy: string;        // User ID of leader who confirmed
  confirmedAt: string;        // When they were confirmed (ISO date)
  notes?: string;             // Optional notes
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

  // Template Reference (pre-fills operation details)
  templateId?: string;        // If created from a template
  templateName?: string;      // Cached template name

  // Operation Details (from template or manually set)
  operationType: OperationType;
  primaryActivity: ActivityType;
  secondaryActivity?: ActivityType;
  tertiaryActivity?: ActivityType;

  // Leadership
  leaders: MissionLeader[];

  // Ship Roster (actual specific ships)
  ships: MissionShip[];

  // Mission Brief
  objectives: string;         // Mission objectives
  briefing: string;           // Full mission briefing/strategy
  equipmentNotes?: string;    // Equipment recommendations (from template)
  images: MissionImage[];     // Reference images/diagrams

  // Discord Integration
  discordEvent?: DiscordEventReference;

  // Participants
  expectedParticipants: ExpectedParticipant[];   // From Discord RSVPs
  confirmedParticipants: ConfirmedParticipant[]; // Marked by leaders post-mission

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
  | 'SCHEDULED'       // Published to Discord, awaiting event
  | 'ACTIVE'          // Mission in progress
  | 'DEBRIEFING'      // Mission ended, marking attendance
  | 'COMPLETED'       // Mission finished, attendance confirmed
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
  ships?: string;
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

// Helper to convert ShipDetails to MissionShip
export function shipDetailsToMissionShip(ship: ShipDetails, quantity: number = 1): MissionShip {
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

// Helper to create empty mission with defaults
export function createEmptyMission(): Partial<PlannedMission> {
  return {
    name: '',
    scheduledDateTime: '',
    operationType: 'Space Operations',
    primaryActivity: 'Mining',
    leaders: [],
    ships: [],
    objectives: '',
    briefing: '',
    images: [],
    expectedParticipants: [],
    confirmedParticipants: [],
    status: 'DRAFT'
  };
}
