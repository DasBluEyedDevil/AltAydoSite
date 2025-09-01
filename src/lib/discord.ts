import { DiscordScheduledEvent, DiscordEventStatus } from '@/types/DiscordEvent';
import { Client, GatewayIntentBits, Guild, GuildMember, Role } from 'discord.js';

// Discord API configuration
const DISCORD_API_BASE = 'https://discord.com/api/v10';

export class DiscordService {
  private botToken: string;
  private guildId: string;
  private client: Client | null = null;
  private guild: Guild | null = null;

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
    return events.filter(event =>
      event.status === DiscordEventStatus.SCHEDULED ||
      event.status === DiscordEventStatus.ACTIVE
    );
  }

  /**
   * Get a single scheduled event by ID
   */
  async getScheduledEvent(eventId: string): Promise<DiscordScheduledEvent | null> {
    if (!this.botToken || !this.guildId) {
      throw new Error('Discord configuration missing');
    }

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
  }

  /**
   * Initialize Discord bot client for role monitoring
   */
  async initializeBot(): Promise<void> {
    if (!this.botToken || !this.guildId) {
      throw new Error('Discord configuration missing');
    }

    if (this.client) {
      return; // Already initialized
    }

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
      ]
    });

    return new Promise((resolve, reject) => {
      this.client!.once('ready', async () => {
        console.log(`Discord bot logged in as ${this.client!.user?.tag}`);
        
        try {
          this.guild = await this.client!.guilds.fetch(this.guildId);
          console.log(`Connected to guild: ${this.guild.name}`);
          resolve();
        } catch (error) {
          console.error('Error fetching guild:', error);
          reject(error);
        }
      });

      this.client!.once('error', (error) => {
        console.error('Discord client error:', error);
        reject(error);
      });

      this.client!.login(this.botToken).catch(reject);
    });
  }

  /**
   * Get all members from the Discord guild
   */
  async getAllMembers(): Promise<GuildMember[]> {
    if (!this.guild) {
      await this.initializeBot();
    }

    if (!this.guild) {
      throw new Error('Guild not available');
    }

    // Fetch all members (this might take some time for large servers)
    const members = await this.guild.members.fetch();
    return Array.from(members.values());
  }

  /**
   * Get member by Discord username or display name
   */
  async getMemberByName(discordName: string): Promise<GuildMember | null> {
    if (!this.guild) {
      await this.initializeBot();
    }

    if (!this.guild) {
      throw new Error('Guild not available');
    }

    const members = await this.guild.members.fetch();
    
    // Try to find by username, display name, or username#discriminator format
    const member = members.find(m => 
      m.user.username === discordName ||
      m.displayName === discordName ||
      `${m.user.username}#${m.user.discriminator}` === discordName ||
      m.user.tag === discordName
    );

    return member || null;
  }

  /**
   * Get roles for a specific member
   */
  async getMemberRoles(member: GuildMember): Promise<Role[]> {
    return Array.from(member.roles.cache.values()).filter(role => role.name !== '@everyone');
  }

  /**
   * Cleanup the Discord client connection
   */
  async cleanup(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
      this.guild = null;
    }
  }

  /**
   * Check if Discord service is properly configured
   */
  isConfigured(): boolean {
    return !!(this.botToken && this.guildId);
  }

  /**
   * Ensure a role exists by name (case-insensitive); create if missing.
   */
  async ensureRoleByName(roleName: string): Promise<Role> {
    if (!this.guild) {
      await this.initializeBot();
    }
    if (!this.guild) throw new Error('Guild not available');

    // Try to find existing role
    const existing = this.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
    if (existing) return existing;

    // Create role if not exists
    console.log(`Creating Discord role: ${roleName}`);
    const created = await this.guild.roles.create({
      name: roleName,
      reason: 'Auto-created for AydoDB synchronization'
    });
    console.log(`Created role ${created.name} (${created.id})`);
    return created;
  }

  /**
   * Assign a role to a guild member by Discord user ID.
   * Returns true if role was added, false if already present or member missing.
   */
  async assignRoleToMember(discordUserId: string, role: Role): Promise<{added: boolean; reason: string;}> {
    if (!this.guild) {
      await this.initializeBot();
    }
    if (!this.guild) throw new Error('Guild not available');

    try {
      const member = await this.guild.members.fetch(discordUserId);
      if (!member) {
        return { added: false, reason: 'member_not_found' };
      }
      if (member.roles.cache.has(role.id)) {
        return { added: false, reason: 'already_has_role' };
      }
      await member.roles.add(role, 'Synced to AydoDB role assignment');
      return { added: true, reason: 'added' };
    } catch (err: any) {
      if (err?.code === 10007) { // Unknown Member
        return { added: false, reason: 'member_not_found' };
      }
      throw err;
    }
  }
}

let discordServiceSingleton: DiscordService | null = null;
export function getDiscordService(): DiscordService {
  if (!discordServiceSingleton) {
    discordServiceSingleton = new DiscordService();
  }
  return discordServiceSingleton;
}