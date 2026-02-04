// Scoped types for Mission Builder (to avoid conflicts with existing Mission types)
// These models mirror the current Mission feature while allowing future expansion
// with objectives, waypoints, and rewards without breaking existing APIs.

export type BuilderMissionStatus =
  | 'Planning'
  | 'Briefing'
  | 'In Progress'
  | 'Debriefing'
  | 'Completed'
  | 'Archived'
  | 'Cancelled';

export type BuilderMissionType =
  | 'Cargo Haul'
  | 'Salvage Operation'
  | 'Bounty Hunting'
  | 'Exploration'
  | 'Reconnaissance'
  | 'Medical Support'
  | 'Combat Patrol'
  | 'Escort Duty'
  | 'Mining Expedition';

// Optional future feature types
export type ObjectiveType = 'fetch' | 'deliver' | 'destroy' | 'scan' | 'escort';

export type Waypoint = {
  id: string;
  system?: string;
  x?: number;
  y?: number;
  z?: number;
  note?: string;
};

export type Reward = {
  credits?: number;
  rep?: number;
  items?: string[];
};

export interface MissionParticipantDraft {
  userId: string;
  userName: string;
  shipId?: string;
  shipName?: string;
  shipType?: string;
  manufacturer?: string;
  fleetyardsId?: string;      // FleetYards UUID (optional during drafting)
  image?: string;
  crewRequirement?: number;
  isGroundSupport?: boolean;
  roles?: string[]; // optional during drafting
}

export interface MissionDraft {
  id?: string;
  name: string;
  type: BuilderMissionType;
  scheduledDateTime: string; // ISO date string
  status: BuilderMissionStatus;
  briefSummary: string;
  details: string;
  location?: string;
  leaderId?: string;
  leaderName?: string;
  images: string[];
  participants: MissionParticipantDraft[];
  waypoints?: Waypoint[];
  rewards?: Reward;
  createdAt?: string; // ISO date string
  updatedAt?: string; // ISO date string
  version?: number;
}
