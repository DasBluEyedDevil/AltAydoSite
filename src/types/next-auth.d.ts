import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's unique ID. */
      id: string;
      /** The user's clearance level. */
      clearanceLevel: number;
      /** The user's role. */
      role: string;
      /** The user's AydoCorp handle. */
      aydoHandle: string;
      /** The user's Discord name. */
      discordName?: string | null;
      /** The user's RSI account name. */
      rsiAccountName?: string | null;
    } & DefaultSession["user"];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    /** The user's clearance level. */
    clearanceLevel: number;
    /** The user's role. */
    role: string;
    /** The user's AydoCorp handle. */
    aydoHandle: string;
    /** The user's Discord name. */
    discordName?: string | null;
    /** The user's RSI account name. */
    rsiAccountName?: string | null;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** The user's ID. */
    id: string;
    /** The user's clearance level. */
    clearanceLevel: number;
    /** The user's role. */
    role: string;
    /** The user's AydoCorp handle. */
    aydoHandle: string;
    /** The user's Discord name. */
    discordName?: string | null;
    /** The user's RSI account name. */
    rsiAccountName?: string | null;
  }
} 