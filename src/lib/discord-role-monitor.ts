import { getDiscordService } from './discord';
import { ROLE_MAPPINGS, getDivisionFromPosition, getHighestClearanceLevel, POSITIONS_WITH_CLEARANCE } from './discord-role-mappings';
import * as userStorage from './user-storage';
import { User } from '@/types/user';

export interface UserRoleUpdate {
  userId: string;
  discordName: string;
  division?: string;
  payGrade?: string;
  position?: string;
  clearanceLevel: number;
  rolesFound: string[];
  updated: boolean;
  error?: string;
}

export class DiscordRoleMonitor {
  private discordService = getDiscordService();
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Start the role monitoring service with 10-minute intervals
   */
  start(): void {
    if (this.isRunning) {
      console.log('Discord role monitor is already running');
      return;
    }

    console.log('Starting Discord role monitor...');
    this.isRunning = true;

    // Run immediately, then every 10 minutes
    this.checkAllUserRoles();
    this.intervalId = setInterval(() => {
      this.checkAllUserRoles();
    }, 10 * 60 * 1000); // 10 minutes

    console.log('Discord role monitor started (checking every 10 minutes)');
  }

  /**
   * Stop the role monitoring service
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('Stopping Discord role monitor...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Cleanup Discord client
    this.discordService.cleanup();
    console.log('Discord role monitor stopped');
  }

  /**
   * Check roles for all users with Discord names
   */
  async checkAllUserRoles(): Promise<UserRoleUpdate[]> {
    console.log('=== Starting Discord role check cycle ===');
    
    try {
      // Get all users from database
      const allUsers = await userStorage.getAllUsers();
      const usersWithDiscord = allUsers.filter(user => user.discordName);

      console.log(`Found ${usersWithDiscord.length} users with Discord names out of ${allUsers.length} total users`);

      if (usersWithDiscord.length === 0) {
        console.log('No users with Discord names found');
        return [];
      }

      const results: UserRoleUpdate[] = [];

      // Process each user
      for (const user of usersWithDiscord) {
        try {
          const result = await this.checkUserRoles(user);
          results.push(result);
        } catch (error) {
          console.error(`Error checking roles for user ${user.aydoHandle} (${user.discordName}):`, error);
          results.push({
            userId: user.id,
            discordName: user.discordName!,
            clearanceLevel: user.clearanceLevel || 1,
            rolesFound: [],
            updated: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      const updatedCount = results.filter(r => r.updated).length;
      const errorCount = results.filter(r => r.error).length;

      console.log(`=== Role check cycle complete ===`);
      console.log(`Processed: ${results.length} users`);
      console.log(`Updated: ${updatedCount} users`);
      console.log(`Errors: ${errorCount} users`);

      return results;

    } catch (error) {
      console.error('Error in checkAllUserRoles:', error);
      return [];
    }
  }

  /**
   * Check roles for a specific user
   */
  async checkUserRoles(user: User): Promise<UserRoleUpdate> {
    console.log(`Checking roles for user: ${user.aydoHandle} (Discord: ${user.discordName})`);

    if (!user.discordName) {
      throw new Error('User has no Discord name');
    }

    // Get Discord member
    const member = await this.discordService.getMemberByName(user.discordName);
    if (!member) {
      throw new Error(`Discord member not found: ${user.discordName}`);
    }

    // Get member's roles
    const memberRoles = await this.discordService.getMemberRoles(member);
    const roleNames = memberRoles.map(role => role.name);
    
    console.log(`Found ${roleNames.length} roles for ${user.discordName}: ${roleNames.join(', ')}`);

    // Map roles to organizational data
    const mappedData = this.mapRolesToOrganizationalData(roleNames);

    // Check if user data needs updating
    const needsUpdate = this.doesUserNeedUpdate(user, mappedData);

    let updated = false;
    if (needsUpdate) {
      // Update user in database
      const updateData: Partial<User> = {
        updatedAt: new Date().toISOString()
      };

      if (mappedData.division !== undefined) updateData.division = mappedData.division;
      if (mappedData.payGrade !== undefined) updateData.payGrade = mappedData.payGrade;
      if (mappedData.position !== undefined) updateData.position = mappedData.position;
      if (mappedData.clearanceLevel !== undefined) updateData.clearanceLevel = mappedData.clearanceLevel;

      const updatedUser = await userStorage.updateUser(user.id, updateData);
      updated = !!updatedUser;

      if (updated) {
        console.log(`Updated user ${user.aydoHandle}:`, {
          division: mappedData.division,
          payGrade: mappedData.payGrade,
          position: mappedData.position,
          clearanceLevel: mappedData.clearanceLevel
        });
      } else {
        console.error(`Failed to update user ${user.aydoHandle}`);
      }
    } else {
      console.log(`No updates needed for user ${user.aydoHandle}`);
    }

    return {
      userId: user.id,
      discordName: user.discordName,
      division: mappedData.division,
      payGrade: mappedData.payGrade,
      position: mappedData.position,
      clearanceLevel: mappedData.clearanceLevel || user.clearanceLevel || 1,
      rolesFound: roleNames,
      updated
    };
  }

  /**
   * Map Discord roles to organizational data
   */
  private mapRolesToOrganizationalData(roleNames: string[]): {
    division?: string;
    payGrade?: string;
    position?: string;
    clearanceLevel?: number;
  } {
    let division: string | undefined;
    let payGrade: string | undefined;
    let position: string | undefined;
    const positions: string[] = [];

    // Process each role
    for (const roleName of roleNames) {
      const mapping = ROLE_MAPPINGS.find(m => m.discordRoleName === roleName);
      
      if (mapping) {
        if (mapping.division) {
          division = mapping.division;
        }
        if (mapping.payGrade) {
          payGrade = mapping.payGrade;
        }
        if (mapping.position) {
          position = mapping.position;
          positions.push(roleName);
        }
      }
    }

    // If we have position roles but no division role, try to infer division from position
    if (!division && positions.length > 0) {
      for (const positionRole of positions) {
        const inferredDivision = getDivisionFromPosition(positionRole);
        if (inferredDivision) {
          division = inferredDivision;
          break;
        }
      }
    }

    // Determine clearance level from positions
    let clearanceLevel: number | undefined;
    if (positions.length > 0) {
      clearanceLevel = getHighestClearanceLevel(positions);
    }

    return {
      division,
      payGrade,
      position,
      clearanceLevel
    };
  }

  /**
   * Check if user data needs updating
   */
  private doesUserNeedUpdate(user: User, mappedData: {
    division?: string;
    payGrade?: string;
    position?: string;
    clearanceLevel?: number;
  }): boolean {
    // Check if any of the mapped values differ from current user data
    if (mappedData.division !== undefined && user.division !== mappedData.division) return true;
    if (mappedData.payGrade !== undefined && user.payGrade !== mappedData.payGrade) return true;
    if (mappedData.position !== undefined && user.position !== mappedData.position) return true;
    if (mappedData.clearanceLevel !== undefined && user.clearanceLevel !== mappedData.clearanceLevel) return true;

    return false;
  }

  /**
   * Get the current status of the monitor
   */
  getStatus(): { isRunning: boolean; nextCheck?: Date } {
    return {
      isRunning: this.isRunning,
      nextCheck: this.intervalId ? new Date(Date.now() + 10 * 60 * 1000) : undefined
    };
  }
}

// Global instance
let discordRoleMonitorInstance: DiscordRoleMonitor | null = null;

export function getDiscordRoleMonitor(): DiscordRoleMonitor {
  if (!discordRoleMonitorInstance) {
    discordRoleMonitorInstance = new DiscordRoleMonitor();
  }
  return discordRoleMonitorInstance;
}
