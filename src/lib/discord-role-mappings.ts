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

// Position mappings with clearance levels (based on your Excel file)
export const POSITIONS_WITH_CLEARANCE = {
  // AydoCorp HQ Positions
  'Chief Executive Officer (CEO)': { position: 'Chief Executive Officer (CEO)', clearanceLevel: 5, division: 'AydoCorp HQ' },
  'Chief Operations Officer (COO)': { position: 'Chief Operations Officer (COO)', clearanceLevel: 5, division: 'AydoCorp HQ' },
  'Chief Technology Officer (CTO)': { position: 'Chief Technology Officer (CTO)', clearanceLevel: 5, division: 'AydoCorp HQ' },
  'Chief Marketing Officer (CMO)': { position: 'Chief Marketing Officer (CMO)', clearanceLevel: 5, division: 'AydoCorp HQ' },
  'Chief Safety Officer (CSO)': { position: 'Chief Safety Officer (CSO)', clearanceLevel: 5, division: 'AydoCorp HQ' },
  
  // Empyrion Industries Positions
  'Director': { position: 'Director', clearanceLevel: 4, division: 'Empyrion Industries' },
  'Ship Captain': { position: 'Ship Captain', clearanceLevel: 3, division: 'Empyrion Industries' },
  'Crew': { position: 'Crew', clearanceLevel: 2, division: 'Empyrion Industries' },
  'Seasonal Hire': { position: 'Seasonal Hire', clearanceLevel: 1, division: 'Empyrion Industries' },
  
  // AydoExpress Positions
  'Sub-Director': { position: 'Sub-Director', clearanceLevel: 4, division: 'AydoExpress' },
  'Supervisor': { position: 'Supervisor', clearanceLevel: 3, division: 'AydoExpress' },
  'Loadmaster': { position: 'Loadmaster', clearanceLevel: 3, division: 'AydoExpress' },
  'Senior Service Agent': { position: 'Senior Service Agent', clearanceLevel: 2, division: 'AydoExpress' },
  'Service Agent': { position: 'Service Agent', clearanceLevel: 2, division: 'AydoExpress' },
  'Associate': { position: 'Associate', clearanceLevel: 1, division: 'AydoExpress' },
  'Trainee': { position: 'Trainee', clearanceLevel: 1, division: 'AydoExpress' },
  
  // Midnight Security Positions
  'Assistant Director': { position: 'Assistant Director', clearanceLevel: 4, division: 'Midnight Security' },
  'Head Pilot': { position: 'Head Pilot', clearanceLevel: 3, division: 'Midnight Security' },
  'Flight Lead': { position: 'Flight Lead', clearanceLevel: 3, division: 'Midnight Security' },
  'Element Lead': { position: 'Element Lead', clearanceLevel: 3, division: 'Midnight Security' },
  'Seasoned Pilot': { position: 'Seasoned Pilot', clearanceLevel: 2, division: 'Midnight Security' },
  'Pilot': { position: 'Pilot', clearanceLevel: 2, division: 'Midnight Security' },
  'Squad Lead': { position: 'Squad Lead', clearanceLevel: 3, division: 'Midnight Security' },
  'Team Lead': { position: 'Team Lead', clearanceLevel: 3, division: 'Midnight Security' },
  'Veteran Marine': { position: 'Veteran Marine', clearanceLevel: 2, division: 'Midnight Security' },
  'Seasoned Marine': { position: 'Seasoned Marine', clearanceLevel: 2, division: 'Midnight Security' },
  'Experienced Marine': { position: 'Experienced Marine', clearanceLevel: 2, division: 'Midnight Security' },
  'Marine': { position: 'Marine', clearanceLevel: 1, division: 'Midnight Security' },
  'Marine Trainee': { position: 'Marine Trainee', clearanceLevel: 1, division: 'Midnight Security' },
  'Engineering Manager': { position: 'Engineering Manager', clearanceLevel: 3, division: 'Midnight Security' },
  'Engineering Lead': { position: 'Engineering Lead', clearanceLevel: 3, division: 'Midnight Security' },
  'Veteran Engineer': { position: 'Veteran Engineer', clearanceLevel: 2, division: 'Midnight Security' },
  'Seasoned Engineer': { position: 'Seasoned Engineer', clearanceLevel: 2, division: 'Midnight Security' },
  'Experienced Engineer': { position: 'Experienced Engineer', clearanceLevel: 2, division: 'Midnight Security' },
  'Engineer': { position: 'Engineer', clearanceLevel: 1, division: 'Midnight Security' },
  'Engineer Trainee': { position: 'Engineer Trainee', clearanceLevel: 1, division: 'Midnight Security' },
  'Gunnery Manager': { position: 'Gunnery Manager', clearanceLevel: 3, division: 'Midnight Security' },
  'Gunnery Lead': { position: 'Gunnery Lead', clearanceLevel: 3, division: 'Midnight Security' },
  'Veteran Gunner': { position: 'Veteran Gunner', clearanceLevel: 2, division: 'Midnight Security' },
  'Seasoned Gunner': { position: 'Seasoned Gunner', clearanceLevel: 2, division: 'Midnight Security' },
  'Experienced Gunner': { position: 'Experienced Gunner', clearanceLevel: 2, division: 'Midnight Security' },
  'Gunner': { position: 'Gunner', clearanceLevel: 1, division: 'Midnight Security' },
  'Gunnery Trainee': { position: 'Gunnery Trainee', clearanceLevel: 1, division: 'Midnight Security' }
} as const;

// Role mapping configuration
// Note: These Discord role names should match exactly what appears in your Discord server
export const ROLE_MAPPINGS: RoleMapping[] = [
  // Pay Grade Roles (standalone roles)
  { discordRoleName: 'Executive', payGrade: PAY_GRADES['Executive'] },
  { discordRoleName: 'Manager', payGrade: PAY_GRADES['Manager'] },
  { discordRoleName: 'Supervisor', payGrade: PAY_GRADES['Supervisor'] },
  { discordRoleName: 'Senior Employee', payGrade: PAY_GRADES['Senior Employee'] },
  { discordRoleName: 'Employee', payGrade: PAY_GRADES['Employee'] },
  { discordRoleName: 'Intern', payGrade: PAY_GRADES['Intern'] },
  { discordRoleName: 'Freelancer', payGrade: PAY_GRADES['Freelancer'] },
  { discordRoleName: 'Prospective Hire', payGrade: PAY_GRADES['Prospective Hire'] },
  
  // Division/Subsidiary Roles (optional - can be inferred from position)
  { discordRoleName: 'AydoCorp HQ', division: DIVISIONS['AydoCorp HQ'] },
  { discordRoleName: 'AydoExpress', division: DIVISIONS['AydoExpress'] },
  { discordRoleName: 'Empyrion Industries', division: DIVISIONS['Empyrion Industries'] },
  { discordRoleName: 'Midnight Security', division: DIVISIONS['Midnight Security'] },
  
  // Position Roles (with clearance levels and divisions)
  ...Object.entries(POSITIONS_WITH_CLEARANCE).map(([discordRoleName, { position, clearanceLevel, division }]) => ({
    discordRoleName,
    position,
    clearanceLevel,
    division
  }))
];

// Helper function to get division from position role name
export function getDivisionFromPosition(positionRoleName: string): string | undefined {
  const positionData = POSITIONS_WITH_CLEARANCE[positionRoleName as keyof typeof POSITIONS_WITH_CLEARANCE];
  return positionData?.division;
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
