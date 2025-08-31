// Discord Role Mappings Configuration
// This file contains the mapping between Discord roles and AydoCorp organizational structure

export interface RoleMapping {
  discordRoleName: string;
  division?: string;
  payGrade?: string;
  position?: string;
  clearanceLevel?: number;
}

// Pay Grade mappings based on organizational hierarchy
export const PAY_GRADES = {
  'Executive': 'Executive',
  'Director': 'Director', 
  'Manager': 'Manager',
  'Supervisor': 'Supervisor',
  'Senior Employee': 'Senior Employee',
  'Employee': 'Employee',
  'Intern': 'Intern',
  'Freelancer': 'Freelancer',
  'Prospective Hire': 'Prospective Hire'
} as const;

// Division mappings
export const DIVISIONS = {
  'AydoCorp HQ': 'AydoCorp HQ',
  'AydoExpress': 'AydoExpress',
  'Empyrion Industries': 'Empyrion Industries', 
  'Midnight Security': 'Midnight Security'
} as const;

// Position mappings with clearance levels
export const POSITIONS_WITH_CLEARANCE = {
  // AydoCorp HQ Positions
  'Chief Executive Officer (CEO)': { position: 'Chief Executive Officer (CEO)', clearanceLevel: 5 },
  'Chief Operations Officer (COO)': { position: 'Chief Operations Officer (COO)', clearanceLevel: 5 },
  'Chief Technology Officer (CTO)': { position: 'Chief Technology Officer (CTO)', clearanceLevel: 5 },
  'Chief Marketing Officer (CMO)': { position: 'Chief Marketing Officer (CMO)', clearanceLevel: 5 },
  'Chief Safety Officer (CSO)': { position: 'Chief Safety Officer (CSO)', clearanceLevel: 5 },
  
  // Empyrion Industries Positions
  'EI Director': { position: 'Director', clearanceLevel: 4 },
  'EI Ship Captain': { position: 'Ship Captain', clearanceLevel: 3 },
  'EI Crew': { position: 'Crew', clearanceLevel: 2 },
  'EI Seasonal Hire': { position: 'Seasonal Hire', clearanceLevel: 1 },
  
  // AydoExpress Positions
  'AE Director': { position: 'Director', clearanceLevel: 4 },
  'AE Sub-Director': { position: 'Sub-Director', clearanceLevel: 4 },
  'AE Supervisor': { position: 'Supervisor', clearanceLevel: 3 },
  'AE Loadmaster': { position: 'Loadmaster', clearanceLevel: 3 },
  'AE Senior Service Agent': { position: 'Senior Service Agent', clearanceLevel: 2 },
  'AE Service Agent': { position: 'Service Agent', clearanceLevel: 2 },
  'AE Associate': { position: 'Associate', clearanceLevel: 1 },
  'AE Trainee': { position: 'Trainee', clearanceLevel: 1 },
  
  // Midnight Security Positions
  'MS Director': { position: 'Director', clearanceLevel: 4 },
  'MS Assistant Director': { position: 'Assistant Director', clearanceLevel: 4 },
  'MS Head Pilot': { position: 'Head Pilot', clearanceLevel: 3 },
  'MS Flight Lead': { position: 'Flight Lead', clearanceLevel: 3 },
  'MS Element Lead': { position: 'Element Lead', clearanceLevel: 3 },
  'MS Seasoned Pilot': { position: 'Seasoned Pilot', clearanceLevel: 2 },
  'MS Pilot': { position: 'Pilot', clearanceLevel: 2 },
  'MS Squad Lead': { position: 'Squad Lead', clearanceLevel: 3 },
  'MS Team Lead': { position: 'Team Lead', clearanceLevel: 3 },
  'MS Veteran Marine': { position: 'Veteran Marine', clearanceLevel: 2 },
  'MS Seasoned Marine': { position: 'Seasoned Marine', clearanceLevel: 2 },
  'MS Experienced Marine': { position: 'Experienced Marine', clearanceLevel: 2 },
  'MS Marine': { position: 'Marine', clearanceLevel: 1 },
  'MS Marine Trainee': { position: 'Marine Trainee', clearanceLevel: 1 },
  'MS Engineering Manager': { position: 'Engineering Manager', clearanceLevel: 3 },
  'MS Engineering Lead': { position: 'Engineering Lead', clearanceLevel: 3 },
  'MS Veteran Engineer': { position: 'Veteran Engineer', clearanceLevel: 2 },
  'MS Seasoned Engineer': { position: 'Seasoned Engineer', clearanceLevel: 2 },
  'MS Experienced Engineer': { position: 'Experienced Engineer', clearanceLevel: 2 },
  'MS Engineer': { position: 'Engineer', clearanceLevel: 1 },
  'MS Engineer Trainee': { position: 'Engineer Trainee', clearanceLevel: 1 },
  'MS Gunnery Manager': { position: 'Gunnery Manager', clearanceLevel: 3 },
  'MS Gunnery Lead': { position: 'Gunnery Lead', clearanceLevel: 3 },
  'MS Veteran Gunner': { position: 'Veteran Gunner', clearanceLevel: 2 },
  'MS Seasoned Gunner': { position: 'Seasoned Gunner', clearanceLevel: 2 },
  'MS Experienced Gunner': { position: 'Experienced Gunner', clearanceLevel: 2 },
  'MS Gunner': { position: 'Gunner', clearanceLevel: 1 },
  'MS Gunnery Trainee': { position: 'Gunnery Trainee', clearanceLevel: 1 }
} as const;

// Role mapping configuration
// Note: These Discord role names should match exactly what appears in your Discord server
export const ROLE_MAPPINGS: RoleMapping[] = [
  // Pay Grade Roles (standalone roles)
  { discordRoleName: 'Executive', payGrade: PAY_GRADES['Executive'] },
  { discordRoleName: 'Director', payGrade: PAY_GRADES['Director'] },
  { discordRoleName: 'Manager', payGrade: PAY_GRADES['Manager'] },
  { discordRoleName: 'Supervisor', payGrade: PAY_GRADES['Supervisor'] },
  { discordRoleName: 'Senior Employee', payGrade: PAY_GRADES['Senior Employee'] },
  { discordRoleName: 'Employee', payGrade: PAY_GRADES['Employee'] },
  { discordRoleName: 'Intern', payGrade: PAY_GRADES['Intern'] },
  { discordRoleName: 'Freelancer', payGrade: PAY_GRADES['Freelancer'] },
  { discordRoleName: 'Prospective Hire', payGrade: PAY_GRADES['Prospective Hire'] },
  
  // Division/Subsidiary Roles
  { discordRoleName: 'AydoCorp HQ', division: DIVISIONS['AydoCorp HQ'] },
  { discordRoleName: 'AydoExpress', division: DIVISIONS['AydoExpress'] },
  { discordRoleName: 'Empyrion Industries', division: DIVISIONS['Empyrion Industries'] },
  { discordRoleName: 'Midnight Security', division: DIVISIONS['Midnight Security'] },
  
  // Position Roles (with clearance levels)
  ...Object.entries(POSITIONS_WITH_CLEARANCE).map(([discordRoleName, { position, clearanceLevel }]) => ({
    discordRoleName,
    position,
    clearanceLevel
  }))
];

// Helper function to get division from position role name
export function getDivisionFromPosition(positionRoleName: string): string | undefined {
  if (positionRoleName.startsWith('Chief ')) return DIVISIONS['AydoCorp HQ'];
  if (positionRoleName.startsWith('EI ')) return DIVISIONS['Empyrion Industries'];
  if (positionRoleName.startsWith('AE ')) return DIVISIONS['AydoExpress'];
  if (positionRoleName.startsWith('MS ')) return DIVISIONS['Midnight Security'];
  return undefined;
}

// Helper function to determine highest clearance level from multiple positions
export function getHighestClearanceLevel(positions: string[]): number {
  let highestClearance = 1; // Default minimum clearance
  
  for (const position of positions) {
    const positionData = POSITIONS_WITH_CLEARANCE[position as keyof typeof POSITIONS_WITH_CLEARANCE];
    if (positionData && positionData.clearanceLevel > highestClearance) {
      highestClearance = positionData.clearanceLevel;
    }
  }
  
  return highestClearance;
}
