import { Session } from 'next-auth';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth";

export type UserSession = Session & {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    clearanceLevel?: number;
  };
};

/**
 * Gets the current session using the auth options
 * Wrapper to simplify getting the session throughout the app
 */
export async function getSession() {
  return getServerSession(authOptions);
}

/**
 * Check if a user has the required clearance level
 * @param session The user session
 * @param requiredLevel The required clearance level (default: 1)
 * @returns Boolean indicating if user has required clearance
 */
export function hasRequiredClearance(
  session: UserSession | null,
  requiredLevel: number = 1
): boolean {
  if (!session?.user?.clearanceLevel) {
    return false;
  }
  
  return session.user.clearanceLevel >= requiredLevel;
}

/**
 * Checks if a user has a minimum clearance level
 * @param session The user session from NextAuth
 * @param level The minimum clearance level required
 * @returns boolean indicating if user meets clearance requirement
 */
export function hasClearance(session: UserSession | null, level: number): boolean {
  return hasRequiredClearance(session, level);
}

/**
 * Check if user is an administrator (clearance level 3)
 * @param session The user session
 * @returns Boolean indicating if user is admin
 */
export function isAdmin(session: UserSession | null): boolean {
  return hasRequiredClearance(session, 3);
}

/**
 * Check if user is a manager (clearance level 2 or higher)
 * @param session The user session
 * @returns Boolean indicating if user is manager or higher
 */
export function isManager(session: UserSession | null): boolean {
  return hasRequiredClearance(session, 2);
}

/**
 * Check if user is a basic member (clearance level 1 or higher)
 * @param session The user session
 * @returns Boolean indicating if user is member or higher
 */
export function isMember(session: UserSession | null): boolean {
  return hasRequiredClearance(session, 1);
}