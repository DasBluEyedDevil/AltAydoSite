// Discord API types for scheduled events
export interface DiscordScheduledEvent {
  id: string;
  guild_id: string;
  channel_id?: string;
  creator_id?: string;
  name: string;
  description?: string;
  scheduled_start_time: string;
  scheduled_end_time?: string;
  privacy_level: number;
  status: number;
  entity_type: number;
  entity_id?: string;
  entity_metadata?: {
    location?: string;
  };
  creator?: {
    id: string;
    username: string;
    avatar?: string;
  };
  user_count?: number;
  image?: string;
  recurrence_rule?: any; // raw Discord recurrence rule (if recurring)
}

// Discord API Response
export interface DiscordEventsResponse {
  events: DiscordScheduledEvent[];
  error?: string;
}

// Event status enum
export enum DiscordEventStatus {
  SCHEDULED = 1,
  ACTIVE = 2,
  COMPLETED = 3,
  CANCELED = 4
}

// Entity type enum
export enum DiscordEntityType {
  STAGE_INSTANCE = 1,
  VOICE = 2,
  EXTERNAL = 3
}

// Privacy level enum  
export enum DiscordPrivacyLevel {
  GUILD_ONLY = 2
}
