import { Session } from 'next-auth';

// Extended session type with additional user properties
export interface UserSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    clearanceLevel: number;
    role: string;
    aydoHandle: string;
    discordName?: string | null;
    rsiAccountName?: string | null;
  };
}

// Helper function to check if user has required clearance level
export const hasRequiredClearance = (session: UserSession | null, requiredLevel: number): boolean => {
  if (!session || !session.user || typeof session.user.clearanceLevel !== 'number') {
    return false;
  }
  return session.user.clearanceLevel >= requiredLevel;
};

// Helper function to check if user has required role
export const hasRequiredRole = (session: UserSession | null, requiredRole: string): boolean => {
  if (!session || !session.user || !session.user.role) {
    return false;
  }
  return session.user.role === requiredRole;
};