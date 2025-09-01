// Discord OAuth utility functions for fetching user guild information and roles

interface DiscordGuildMember {
  user: {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
  };
  roles: string[];
  nick: string | null;
  joined_at: string;
  premium_since: string | null;
}

interface DiscordRole {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
}

interface DiscordUserProfile {
  division: string | null;
  position: string | null;
  payGrade: string | null;
  clearanceLevel: number;
  displayName: string;
  roles: string[];
}

/**
 * Fetch Discord guild member information including roles
 */
export async function fetchDiscordGuildMember(
  accessToken: string,
  guildId: string
): Promise<DiscordGuildMember | null> {
  try {
    console.log('Fetching Discord guild member info for guild:', guildId);
    
    const response = await fetch(
      `https://discord.com/api/v10/users/@me/guilds/${guildId}/member`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch guild member:', response.status, response.statusText);
      return null;
    }

    const memberData: DiscordGuildMember = await response.json();
    console.log('Discord guild member data:', {
      userId: memberData.user.id,
      username: memberData.user.username,
      roleCount: memberData.roles.length,
      nickname: memberData.nick
    });

    return memberData;
  } catch (error) {
    console.error('Error fetching Discord guild member:', error);
    return null;
  }
}

/**
 * Fetch Discord guild roles to map role IDs to role names
 */
export async function fetchDiscordGuildRoles(guildId: string): Promise<DiscordRole[]> {
  try {
    console.log('Fetching Discord guild roles for guild:', guildId);
    
    // Use bot token to fetch guild roles (OAuth token doesn't have this permission)
    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) {
      console.error('Discord bot token not configured');
      return [];
    }

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
      console.error('Failed to fetch guild roles:', response.status, response.statusText);
      return [];
    }

    const roles: DiscordRole[] = await response.json();
    console.log(`Fetched ${roles.length} roles from Discord guild`);

    return roles;
  } catch (error) {
    console.error('Error fetching Discord guild roles:', error);
    return [];
  }
}

/**
 * Parse Discord roles to extract division and position information
 */
export function parseDiscordRoles(
  userRoleIds: string[],
  guildRoles: DiscordRole[],
  discordUsername: string,
  discordNickname?: string | null
): DiscordUserProfile {
  console.log('Parsing Discord roles for user:', discordUsername);
  
  // Map role IDs to role names
  const userRoleNames = userRoleIds
    .map(roleId => {
      const role = guildRoles.find(r => r.id === roleId);
      return role ? role.name : null;
    })
    .filter(Boolean) as string[];

  console.log('User roles:', userRoleNames);

  // Define role mapping patterns based on AydoCorp organizational structure
  const divisionPatterns = [
    { pattern: /aydoexpress|aydo express/i, division: 'AydoExpress' },
    { pattern: /empyrion industries|empyrion/i, division: 'Empyrion Industries' },
    { pattern: /midnight security|midnight/i, division: 'Midnight Security' },
  ];

  const positionPatterns = [
    // Executive Level
    { pattern: /chief executive officer|ceo/i, position: 'Chief Executive Officer (CEO)' },
    { pattern: /chief operations officer|coo/i, position: 'Chief Operations Officer (COO)' },
    { pattern: /chief technology officer|cto/i, position: 'Chief Technology Officer (CTO)' },
    { pattern: /chief marketing officer|cmo/i, position: 'Chief Marketing Officer (CMO)' },
    { pattern: /chief safety officer|cso/i, position: 'Chief Safety Officer (CSO)' },
    
    // Director Level
    { pattern: /^director$/i, position: 'Director' },
    { pattern: /assistant director/i, position: 'Assistant Director' },
    { pattern: /sub-director/i, position: 'Sub-Director' },
    
    // Management Level
    { pattern: /^manager$/i, position: 'Manager' },
    { pattern: /supervisor/i, position: 'Supervisor' },
    { pattern: /loadmaster/i, position: 'Loadmaster' },
    
    // Specialized Positions
    { pattern: /ship captain/i, position: 'Ship Captain' },
    { pattern: /head pilot/i, position: 'Head Pilot' },
    { pattern: /flight lead/i, position: 'Flight Lead' },
    { pattern: /element lead/i, position: 'Element Lead' },
    { pattern: /seasoned pilot/i, position: 'Seasoned Pilot' },
    { pattern: /squad lead/i, position: 'Squad Lead' },
    { pattern: /team lead/i, position: 'Team Lead' },
    
    // Service and Operations
    { pattern: /senior service agent/i, position: 'Senior Service Agent' },
    { pattern: /service agent/i, position: 'Service Agent' },
    { pattern: /^pilot$/i, position: 'Pilot' },
    { pattern: /^associate$/i, position: 'Associate' },
    { pattern: /^trainee$/i, position: 'Trainee' },
    
    // Marine/Security Ranks
    { pattern: /veteran marine/i, position: 'Veteran Marine' },
    { pattern: /seasoned marine/i, position: 'Seasoned Marine' },
    { pattern: /experienced marine/i, position: 'Experienced Marine' },
    { pattern: /^marine$/i, position: 'Marine' },
    { pattern: /marine trainee/i, position: 'Marine Trainee' },
    
    // Engineering
    { pattern: /engineering manager/i, position: 'Engineering Manager' },
    { pattern: /engineering lead/i, position: 'Engineering Lead' },
    { pattern: /veteran engineer/i, position: 'Veteran Engineer' },
    { pattern: /seasoned engineer/i, position: 'Seasoned Engineer' },
    { pattern: /experienced engineer/i, position: 'Experienced Engineer' },
    { pattern: /^engineer$/i, position: 'Engineer' },
    { pattern: /engineer trainee/i, position: 'Engineer Trainee' },
    
    // Gunnery
    { pattern: /gunnery manager/i, position: 'Gunnery Manager' },
    { pattern: /gunnery lead/i, position: 'Gunnery Lead' },
    { pattern: /veteran gunner/i, position: 'Veteran Gunner' },
    { pattern: /seasoned gunner/i, position: 'Seasoned Gunner' },
    { pattern: /experienced gunner/i, position: 'Experienced Gunner' },
    { pattern: /^gunner$/i, position: 'Gunner' },
    { pattern: /gunnery trainee/i, position: 'Gunnery Trainee' },
    
    // General Employee Levels
    { pattern: /senior employee/i, position: 'Senior Employee' },
    { pattern: /^employee$/i, position: 'Employee' },
    { pattern: /^intern$/i, position: 'Intern' },
    { pattern: /^freelancer$/i, position: 'Freelancer' },
    { pattern: /prospective hire/i, position: 'Prospective Hire' },
    
    // Seasonal/Temporary
    { pattern: /seasonal hire/i, position: 'Seasonal Hire' },
    { pattern: /^crew$/i, position: 'Crew' },
  ];

  // Find division from roles
  let division: string | null = null;
  for (const roleName of userRoleNames) {
    const divisionMatch = divisionPatterns.find(p => p.pattern.test(roleName));
    if (divisionMatch) {
      division = divisionMatch.division;
      break;
    }
  }

  // Find position from roles
  let position: string | null = null;
  for (const roleName of userRoleNames) {
    const positionMatch = positionPatterns.find(p => p.pattern.test(roleName));
    if (positionMatch) {
      position = positionMatch.position;
      break;
    }
  }

  // Find paygrade from roles (paygrade is a separate Discord role)
  let payGrade: string | null = null;
  
  // Define paygrade patterns based on Discord Employment Status roles
  const payGradePatterns = [
    { pattern: /^AIC Board$/i, payGrade: 'AIC Board' },
    { pattern: /^Upper Management$/i, payGrade: 'Upper Management' },
    { pattern: /^Lower Management$/i, payGrade: 'Lower Management' },
    { pattern: /^Employee$/i, payGrade: 'Employee' },
    { pattern: /^Freelancer$/i, payGrade: 'Freelancer' },
    { pattern: /^Prospective Hire$/i, payGrade: 'Prospective Hire' },
    { pattern: /^Intern$/i, payGrade: 'Intern' },
  ];

  // Find paygrade from roles
  for (const roleName of userRoleNames) {
    const payGradeMatch = payGradePatterns.find(p => p.pattern.test(roleName));
    if (payGradeMatch) {
      payGrade = payGradeMatch.payGrade;
      break;
    }
  }

  // Determine display name (prefer nickname over username)
  const displayName = discordNickname || discordUsername;

  console.log('Parsed Discord profile:', {
    displayName,
    division,
    position,
    payGrade,
    roleCount: userRoleNames.length
  });

  // Special case: AIC Board members should be in AydoCorp HQ division
  let finalDivision = division;
  if (payGrade === 'AIC Board') {
    finalDivision = 'AydoCorp HQ';
  }

  // Map position to clearance level
  const clearanceLevel = getClearanceLevelFromPosition(position, payGrade);

  return {
    division: finalDivision,
    position,
    payGrade,
    clearanceLevel,
    displayName,
    roles: userRoleNames
  };
}

/**
 * Map position and paygrade to clearance level based on AydoCorp organizational structure
 */
function getClearanceLevelFromPosition(position: string | null, payGrade: string | null): number {
  if (!position) return 1; // Default for unknown positions
  
  const positionLower = position.toLowerCase();
  
  // AYDOCORP HQ - AIC Board members (no specific clearance listed, but should be highest)
  if (payGrade === 'AIC Board') {
    return 10; // Highest clearance for board members
  }
  
  // EMPYRION INDUSTRIES - All positions get clearance level 5
  if (positionLower.includes('director') || 
      positionLower.includes('ship captain') || 
      positionLower.includes('crew') || 
      positionLower.includes('seasonal hire')) {
    return 5;
  }
  
  // AYDOEXPRESS clearance levels
  if (positionLower.includes('director')) return 4;
  if (positionLower.includes('sub-director')) return 3;
  if (positionLower.includes('supervisor')) return 2;
  if (positionLower.includes('loadmaster')) return 1;
  if (positionLower.includes('senior service agent')) return 1; // No clearance listed, default to 1
  if (positionLower.includes('service agent')) return 1; // No clearance listed, default to 1
  if (positionLower.includes('associate')) return 1; // No clearance listed, default to 1
  if (positionLower.includes('trainee')) return 1; // No clearance listed, default to 1
  
  // MIDNIGHT SECURITY clearance levels
  if (positionLower.includes('director')) return 4;
  if (positionLower.includes('assistant director')) return 4;
  if (positionLower.includes('head pilot')) return 3;
  if (positionLower.includes('flight lead')) return 3;
  if (positionLower.includes('element lead')) return 2;
  if (positionLower.includes('seasoned pilot')) return 2;
  if (positionLower.includes('pilot')) return 1;
  if (positionLower.includes('squad lead')) return 3;
  if (positionLower.includes('team lead')) return 3;
  if (positionLower.includes('veteran marine')) return 2;
  if (positionLower.includes('seasoned marine')) return 2;
  if (positionLower.includes('experienced marine')) return 2;
  if (positionLower.includes('marine')) return 1;
  if (positionLower.includes('marine trainee')) return 1;
  
  // Engineering roles
  if (positionLower.includes('engineering manager')) return 3;
  if (positionLower.includes('engineering lead')) return 3;
  if (positionLower.includes('veteran engineer')) return 2;
  if (positionLower.includes('seasoned engineer')) return 2;
  if (positionLower.includes('experienced engineer')) return 2;
  if (positionLower.includes('engineer')) return 1;
  if (positionLower.includes('engineer trainee')) return 1;
  
  // Gunnery roles
  if (positionLower.includes('gunnery manager')) return 3;
  if (positionLower.includes('gunnery lead')) return 3;
  if (positionLower.includes('veteran gunner')) return 2;
  if (positionLower.includes('seasoned gunner')) return 2;
  if (positionLower.includes('experienced gunner')) return 2;
  if (positionLower.includes('gunner')) return 1;
  if (positionLower.includes('gunnery trainee')) return 1;
  
  // General management roles
  if (positionLower.includes('manager')) return 2; // Default manager clearance
  if (positionLower.includes('lead')) return 2; // Default lead clearance
  
  // Employment status fallbacks
  if (payGrade === 'Upper Management') return 4;
  if (payGrade === 'Lower Management') return 3;
  if (payGrade === 'Employee') return 2;
  if (payGrade === 'Freelancer') return 1;
  if (payGrade === 'Intern') return 1;
  if (payGrade === 'Prospective Hire') return 1;
  
  // Default clearance for unknown positions
  return 1;
}

/**
 * Complete Discord profile sync - fetch member info, roles, and parse data
 */
export async function syncDiscordProfile(
  accessToken: string,
  discordUserId: string,
  discordUsername: string
): Promise<DiscordUserProfile> {
  const guildId = process.env.DISCORD_GUILD_ID;
  
  if (!guildId) {
    console.error('Discord guild ID not configured');
    return {
      division: null,
      position: null,
      payGrade: null,
      displayName: discordUsername,
      roles: []
    };
  }

  try {
    // Fetch user's guild member information
    const memberInfo = await fetchDiscordGuildMember(accessToken, guildId);
    
    if (!memberInfo) {
      console.log('Could not fetch guild member info, using basic profile');
      return {
        division: null,
        position: null,
        payGrade: null,
        displayName: discordUsername,
        roles: []
      };
    }

    // Fetch guild roles to map IDs to names
    const guildRoles = await fetchDiscordGuildRoles(guildId);

    // Parse roles to extract division and position
    const profile = parseDiscordRoles(
      memberInfo.roles,
      guildRoles,
      discordUsername,
      memberInfo.nick
    );

    return profile;
  } catch (error) {
    console.error('Error syncing Discord profile:', error);
    return {
      division: null,
      position: null,
      displayName: discordUsername,
      roles: []
    };
  }
}
