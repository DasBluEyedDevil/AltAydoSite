export type OperationStatus = 'Planning' | 'Briefing' | 'Active' | 'Completed' | 'Debriefing' | 'Cancelled';

export interface OperationParticipant {
  userId: string;
  shipName?: string;
  shipManufacturer?: string;
  fleetyardsId?: string;      // FleetYards UUID (optional)
  role: string;
  notes?: string;
}

export interface Operation {
  id: string;
  name: string;
  description: string;
  status: OperationStatus;
  leaderId: string;
  plannedDateTime: string; // ISO date string
  location: string;
  objectives: string;
  participants: OperationParticipant[];
  diagramLinks: string[];
  commsChannel: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface OperationResponse extends Operation {
  leaderName?: string;
} 