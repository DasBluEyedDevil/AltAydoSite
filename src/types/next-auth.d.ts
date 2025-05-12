import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import 'next-auth';

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      clearanceLevel?: number;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    clearanceLevel?: number;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
} 