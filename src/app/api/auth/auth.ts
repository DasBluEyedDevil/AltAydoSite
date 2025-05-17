import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { createClient } from '@/utils/supabase/server';

const prisma = new PrismaClient();

// In a real application, this would be replaced with a database call
const users = [
  {
    id: '1',
    aydoHandle: 'admin',
    email: 'admin@aydocorp.com',
    passwordHash: '$2b$10$8OxDFt.GT.LV4xmX9ATR8.w4kGhJZgXnqnZqf5wn3EHQ8GqOAFMaK', // "password123"
    clearanceLevel: 5,
    role: 'admin',
    discordName: 'admin#1234',
    rsiAccountName: 'admin_rsi'
  },
  {
    id: '2',
    aydoHandle: 'user',
    email: 'user@aydocorp.com',
    passwordHash: '$2b$10$8OxDFt.GT.LV4xmX9ATR8.w4kGhJZgXnqnZqf5wn3EHQ8GqOAFMaK', // "password123"
    clearanceLevel: 1,
    role: 'user',
    discordName: 'user#5678',
    rsiAccountName: 'user_rsi'
  }
];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'AydoCorp Credentials',
      credentials: {
        aydoHandle: { label: 'AydoCorp Handle', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.aydoHandle || !credentials?.password) {
          return null;
        }

        try {
          // Get the user from the database
          const user = await prisma.user.findUnique({
            where: { aydoHandle: credentials.aydoHandle }
          });
          
          if (!user) {
            return null;
          }

          // Ensure the user has a passwordHash
          if (!user.passwordHash) {
            console.error('User missing passwordHash');
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
          
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            name: user.aydoHandle,
            email: user.email,
            clearanceLevel: user.clearanceLevel,
            role: user.role,
            aydoHandle: user.aydoHandle,
            discordName: user.discordName || null,
            rsiAccountName: user.rsiAccountName || null
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error('Database connection error');
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          id: user.id,
          clearanceLevel: user.clearanceLevel,
          role: user.role,
          aydoHandle: user.aydoHandle,
          discordName: user.discordName,
          rsiAccountName: user.rsiAccountName
        };
      }
      
      // Return previous token if the access token has not expired
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.clearanceLevel = token.clearanceLevel as number;
        session.user.role = token.role as string;
        session.user.aydoHandle = token.aydoHandle as string;
        session.user.discordName = token.discordName as string | null;
        session.user.rsiAccountName = token.rsiAccountName as string | null;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

export default authOptions;