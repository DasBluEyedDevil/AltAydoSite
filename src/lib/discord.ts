import { DiscordScheduledEvent, DiscordEventStatus } from '@/types/DiscordEvent';

// Discord API configuration
const DISCORD_API_BASE = 'https://discord.com/api/v10';

export class DiscordService {
  private botToken: string;
  private guildId: string;

  constructor() {
    this.botToken = process.env.DISCORD_BOT_TOKEN || '';
    this.guildId = process.env.DISCORD_GUILD_ID || '';
  }

  /**
   * Fetch scheduled events from Discord API
   */
  async getScheduledEvents(): Promise<DiscordScheduledEvent[]> {
    if (!this.botToken || !this.guildId) {
      throw new Error('Discord configuration missing');
    }

    try {
      const response = await fetch(
        `${DISCORD_API_BASE}/guilds/${this.guildId}/scheduled-events`,
        {
          headers: {
            'Authorization': `Bot ${this.botToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Discord API error: ${response.status} - ${errorText}`);
      }

      const events: DiscordScheduledEvent[] = await response.json();
      
      // Filter out completed or canceled events
      return events.filter(event => 
        event.status === DiscordEventStatus.SCHEDULED || 
        event.status === DiscordEventStatus.ACTIVE
      );
    } catch (error) {
      console.error('Error fetching Discord events:', error);
      throw error;
    }
  }

  /**
   * Get a single scheduled event by ID
   */
  async getScheduledEvent(eventId: string): Promise<DiscordScheduledEvent | null> {
    if (!this.botToken || !this.guildId) {
      throw new Error('Discord configuration missing');
    }

    try {
      const response = await fetch(
        `${DISCORD_API_BASE}/guilds/${this.guildId}/scheduled-events/${eventId}`,
        {
          headers: {
            'Authorization': `Bot ${this.botToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorText = await response.text();
        throw new Error(`Discord API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Discord event:', error);
      throw error;
    }
  }

  /**
   * Check if Discord service is properly configured
   */
  isConfigured(): boolean {
    return !!(this.botToken && this.guildId);
  }
}

let discordServiceSingleton: DiscordService | null = null;
export function getDiscordService(): DiscordService {
  if (!discordServiceSingleton) {
    discordServiceSingleton = new DiscordService();
  }
  return discordServiceSingleton;
}