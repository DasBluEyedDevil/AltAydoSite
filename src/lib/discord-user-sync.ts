// Discord User Sync Service
// Syncs existing website users with Discord server members to update profiles

import * as userStorage from '@/lib/user-storage';
import { User } from '@/types/user';
import { parseDiscordRoles } from '@/lib/discord-oauth';

interface DiscordGuildMember {
  user: {
    id: string;
    username: string;
    discriminator: string;
    global_name?: string;
    avatar?: string;
  };
  nick?: string;
  roles: string[];
  joined_at: string;
}

interface DiscordRole {
  id: string;
  name: string;
  color: number;
  position: number;
}

interface SyncResult {
  totalUsers: number;
  matchedUsers: number;
  updatedUsers: number;
  errors: string[];
  matches: {
    userId: string;
    aydoHandle: string;
    discordName: string;
    matchedBy: 'discordName' | 'username' | 'nickname';
    division?: string;
    position?: string;
    updated: boolean;
  }[];
}

/**
 * Fetch all members from Discord guild using bot token
 */
async function fetchAllGuildMembers(guildId: string): Promise<DiscordGuildMember[]> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) {
    throw new Error('Discord bot token not configured');
  }

  try {
    console.log(`Fetching all members from Discord guild: ${guildId}`);
    
    const members: DiscordGuildMember[] = [];
    let after = '0';
    let hasMore = true;

    // Discord API returns max 1000 members per request, so we need to paginate
    while (hasMore) {
      const response = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/members?limit=1000&after=${after}`,
        {
          headers: {
            'Authorization': `Bot ${botToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch guild members: ${response.status} ${response.statusText}`);
      }

      const batch: DiscordGuildMember[] = await response.json();
      members.push(...batch);

      if (batch.length < 1000) {
        hasMore = false;
      } else {
        after = batch[batch.length - 1].user.id;
      }

      console.log(`Fetched ${members.length} Discord members so far...`);
    }

    console.log(`Total Discord members fetched: ${members.length}`);
    return members;
  } catch (error) {
    console.error('Error fetching Discord guild members:', error);
    throw error;
  }
}

/**
 * Fetch Discord guild roles
 */
async function fetchGuildRoles(guildId: string): Promise<DiscordRole[]> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!botToken) {
    throw new Error('Discord bot token not configured');
  }

  try {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/roles`,
      {
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch guild roles: ${response.status} ${response.statusText}`);
    }

    const roles: DiscordRole[] = await response.json();
    console.log(`Fetched ${roles.length} Discord roles`);
    return roles;
  } catch (error) {
    console.error('Error fetching Discord guild roles:', error);
    throw error;
  }
}

/**
 * Match website users with Discord members
 */
function matchUsersWithDiscordMembers(
  users: User[],
  discordMembers: DiscordGuildMember[]
): { user: User; member: DiscordGuildMember; matchedBy: string }[] {
  const matches: { user: User; member: DiscordGuildMember; matchedBy: string }[] = [];

  console.log(`Matching ${users.length} website users with ${discordMembers.length} Discord members`);

  for (const user of users) {
    let match: DiscordGuildMember | null = null;
    let matchedBy = '';

    // First, try to match by stored Discord ID (most reliable)
    if (user.discordId) {
      match = discordMembers.find(member => member.user.id === user.discordId) || null;
      if (match) {
        matchedBy = 'discordId';
      }
    }

    // If no Discord ID match, try multiple matching strategies
    if (!match && user.discordName) {
      // First try exact match with stored discordName (username#discriminator format)
      match = discordMembers.find(member => 
        `${member.user.username}#${member.user.discriminator}` === user.discordName
      ) || null;
      if (match) {
        matchedBy = 'discordName';
      }

      // If no exact match, try matching just the username part (before #)
      if (!match) {
        const storedUsername = user.discordName.split('#')[0];
        match = discordMembers.find(member => 
          member.user.username.toLowerCase() === storedUsername.toLowerCase()
        ) || null;
        if (match) {
          matchedBy = 'discordNamePartial';
        }
      }
    }

    // Try to match AydoCorp handle with Discord username
    if (!match && user.aydoHandle) {
      match = discordMembers.find(member => 
        member.user.username.toLowerCase() === user.aydoHandle.toLowerCase()
      ) || null;
      if (match) {
        matchedBy = 'aydoHandleUsername';
      }
    }

    // Try to match AydoCorp handle with Discord nickname
    if (!match && user.aydoHandle) {
      match = discordMembers.find(member => 
        member.nick?.toLowerCase() === user.aydoHandle.toLowerCase()
      ) || null;
      if (match) {
        matchedBy = 'aydoHandleNickname';
      }
    }

    // Try fuzzy matching - remove common prefixes/suffixes and special characters
    if (!match && user.aydoHandle) {
      const cleanHandle = user.aydoHandle.toLowerCase()
        .replace(/[\[\](){}]/g, '') // Remove brackets and parentheses
        .replace(/[_-]/g, '') // Remove underscores and hyphens
        .trim();

      match = discordMembers.find(member => {
        const cleanUsername = member.user.username.toLowerCase()
          .replace(/[\[\](){}]/g, '')
          .replace(/[_-]/g, '')
          .trim();
        const cleanNick = member.nick?.toLowerCase()
          .replace(/[\[\](){}]/g, '')
          .replace(/[_-]/g, '')
          .trim();

        return cleanUsername === cleanHandle || cleanNick === cleanHandle;
      }) || null;
      
      if (match) {
        matchedBy = 'fuzzyMatch';
      }
    }

    // Last resort: check if aydoHandle is contained within Discord username or nickname
    if (!match && user.aydoHandle && user.aydoHandle.length > 3) {
      const handleLower = user.aydoHandle.toLowerCase();
      match = discordMembers.find(member => 
        member.user.username.toLowerCase().includes(handleLower) ||
        member.nick?.toLowerCase().includes(handleLower)
      ) || null;
      if (match) {
        matchedBy = 'containsMatch';
      }
    }

    if (match) {
      matches.push({ user, member: match, matchedBy });
      console.log(`Matched user ${user.aydoHandle} with Discord ${match.user.username}#${match.user.discriminator} (${matchedBy})`);
    }
  }

  console.log(`Found ${matches.length} matches out of ${users.length} users`);
  return matches;
}

/**
 * Sync all existing users with Discord server data
 */
export async function syncAllUsersWithDiscord(): Promise<SyncResult> {
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!guildId) {
    throw new Error('Discord guild ID not configured');
  }

  console.log('Starting Discord user sync...');

  const result: SyncResult = {
    totalUsers: 0,
    matchedUsers: 0,
    updatedUsers: 0,
    errors: [],
    matches: []
  };

  try {
    // Fetch all website users
    console.log('Fetching all website users...');
    const users = await userStorage.getAllUsers();
    result.totalUsers = users.length;
    console.log(`Found ${users.length} website users`);

    // Fetch all Discord members
    console.log('Fetching Discord guild members...');
    const discordMembers = await fetchAllGuildMembers(guildId);

    // Fetch Discord roles for mapping
    console.log('Fetching Discord guild roles...');
    const guildRoles = await fetchGuildRoles(guildId);

    // Match users with Discord members
    const matches = matchUsersWithDiscordMembers(users, discordMembers);
    result.matchedUsers = matches.length;

    // Update matched users
    console.log('Updating matched users...');
    for (const { user, member, matchedBy } of matches) {
      try {
        // Parse Discord roles to get division and position
        const discordProfile = parseDiscordRoles(
          member.roles,
          guildRoles,
          member.user.username,
          member.nick
        );

        // Prepare update data - always update Discord info when matched
        const correctDiscordName = `${member.user.username}#${member.user.discriminator}`;
        const updateData: Partial<User> = {
          discordId: member.user.id,
          discordName: correctDiscordName,
          discordAvatar: member.user.avatar ? 
            `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png` : null,
          updatedAt: new Date().toISOString()
        };

        console.log(`Updating Discord info for ${user.aydoHandle}: ${user.discordName || 'none'} → ${correctDiscordName}`);

        // Only update division/position/paygrade/clearanceLevel if we found them from roles
        if (discordProfile.division) {
          updateData.division = discordProfile.division;
        }
        if (discordProfile.position) {
          updateData.position = discordProfile.position;
        }
        if (discordProfile.payGrade) {
          updateData.payGrade = discordProfile.payGrade;
        }
        if (discordProfile.clearanceLevel) {
          updateData.clearanceLevel = discordProfile.clearanceLevel;
        }

        // Update the user
        const updatedUser = await userStorage.updateUser(user.id, updateData);
        
        if (updatedUser) {
          result.updatedUsers++;
          result.matches.push({
            userId: user.id,
            aydoHandle: user.aydoHandle,
            discordName: `${member.user.username}#${member.user.discriminator}`,
            matchedBy: matchedBy as any,
            division: discordProfile.division || undefined,
            position: discordProfile.position || undefined,
            updated: true
          });

          console.log(`Updated user ${user.aydoHandle}:`, {
            division: discordProfile.division,
            position: discordProfile.position,
            payGrade: discordProfile.payGrade,
            clearanceLevel: discordProfile.clearanceLevel,
            discordName: updateData.discordName
          });
        } else {
          result.errors.push(`Failed to update user ${user.aydoHandle}`);
          result.matches.push({
            userId: user.id,
            aydoHandle: user.aydoHandle,
            discordName: `${member.user.username}#${member.user.discriminator}`,
            matchedBy: matchedBy as any,
            updated: false
          });
        }
      } catch (error) {
        const errorMsg = `Error updating user ${user.aydoHandle}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        result.errors.push(errorMsg);
      }
    }

    console.log('Discord user sync completed:', {
      totalUsers: result.totalUsers,
      matchedUsers: result.matchedUsers,
      updatedUsers: result.updatedUsers,
      errors: result.errors.length
    });

    return result;
  } catch (error) {
    const errorMsg = `Discord sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    result.errors.push(errorMsg);
    return result;
  }
}

/**
 * Sync a specific user with Discord data by their user ID
 */
export async function syncSingleUserWithDiscord(userId: string): Promise<SyncResult> {
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!guildId) {
    throw new Error('Discord guild ID not configured');
  }

  console.log(`Syncing single user: ${userId}`);

  const result: SyncResult = {
    totalUsers: 1,
    matchedUsers: 0,
    updatedUsers: 0,
    errors: [],
    matches: []
  };

  try {
    // Get the specific user
    const user = await userStorage.getUserById(userId);
    if (!user) {
      result.errors.push(`User not found: ${userId}`);
      return result;
    }

    // Fetch Discord members and roles
    const discordMembers = await fetchAllGuildMembers(guildId);
    const guildRoles = await fetchGuildRoles(guildId);

    // Match this user with Discord members
    const matches = matchUsersWithDiscordMembers([user], discordMembers);
    
    if (matches.length === 0) {
      result.errors.push(`No Discord match found for user ${user.aydoHandle}`);
      return result;
    }

    result.matchedUsers = 1;
    const { member, matchedBy } = matches[0];

    // Parse Discord roles and update user
    const discordProfile = parseDiscordRoles(
      member.roles,
      guildRoles,
      member.user.username,
      member.nick
    );

    const updateData: Partial<User> = {
      discordId: member.user.id,
      discordName: `${member.user.username}#${member.user.discriminator}`,
      discordAvatar: member.user.avatar ? 
        `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.png` : null,
      division: discordProfile.division || user.division,
      position: discordProfile.position || user.position,
      payGrade: discordProfile.payGrade || user.payGrade,
      updatedAt: new Date().toISOString()
    };

    const updatedUser = await userStorage.updateUser(user.id, updateData);
    
    if (updatedUser) {
      result.updatedUsers = 1;
      result.matches.push({
        userId: user.id,
        aydoHandle: user.aydoHandle,
        discordName: `${member.user.username}#${member.user.discriminator}`,
        matchedBy: matchedBy as any,
        division: discordProfile.division || undefined,
        position: discordProfile.position || undefined,
        updated: true
      });
    } else {
      result.errors.push(`Failed to update user ${user.aydoHandle}`);
    }

    return result;
  } catch (error) {
    const errorMsg = `Single user sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    result.errors.push(errorMsg);
    return result;
  }
}
