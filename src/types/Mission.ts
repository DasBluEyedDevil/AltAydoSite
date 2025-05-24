export type MissionStatus = 'Planning' | 'Briefing' | 'In Progress' | 'Debriefing' | 'Completed' | 'Archived' | 'Cancelled';

export type MissionType = 'Cargo Haul' | 'Salvage Operation' | 'Bounty Hunting' | 'Exploration' | 
  'Reconnaissance' | 'Medical Support' | 'Combat Patrol' | 'Escort Duty' | 'Mining Expedition';

export interface MissionParticipant {
  userId: string;
  userName: string;
  shipId?: string;
  shipName?: string;
  shipType?: string;
  roles: string[];
}

export interface Mission {
  id: string;
  name: string;
  type: MissionType;
  scheduledDateTime: string; // ISO date string
  status: MissionStatus;
  briefSummary: string;
  details: string;
  location?: string;
  leaderId?: string;
  leaderName?: string;
  images: string[];
  participants: MissionParticipant[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface MissionResponse extends Mission {} 