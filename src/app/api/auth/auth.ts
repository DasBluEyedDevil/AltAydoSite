import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { User } from '@/types/user';
import * as userStorage from '@/lib/user-storage';

// Admin user for fallback
const adminUser: User = {
  id: '1',
  aydoHandle: 'admin',
  email: 'admin@aydocorp.com',
  passwordHash: '$2b$10$8OxDFt.GT.LV4xmX9ATR8.w4kGhJZgXnqnZqf5wn3EHQ8GqOAFMaK', // "password123"
  clearanceLevel: 5,
  role: 'admin',
  discordName: 'admin#1234',
  rsiAccountName: 'admin_rsi'
};

export const authOptions: NextAuthOptions = {
  providers: [
    // Traditional Credentials Provider
    CredentialsProvider({
      name: 'AydoCorp Credentials',
      credentials: {
        aydoHandle: { label: 'AydoCorp Handle', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('AUTH: Credentials authorize called with handle:', credentials?.aydoHandle);
        
        if (!credentials?.aydoHandle || !credentials?.password) {
          console.log('AUTH: Missing credentials');
          return null;
        }

        try {
          // Admin user special case - always allow admin login
          if (credentials.aydoHandle.toLowerCase() === 'admin') {
            console.log('AUTH: Admin login attempt');
            const isPasswordValid = await bcrypt.compare(credentials.password, adminUser.passwordHash);

            if (!isPasswordValid) {
              console.log('AUTH: Invalid admin password');
              return null;
            }

            console.log('AUTH: Admin authentication successful');
            return {
              id: adminUser.id,
              name: adminUser.aydoHandle,
              email: adminUser.email,
              clearanceLevel: adminUser.clearanceLevel,
              role: adminUser.role,
              aydoHandle: adminUser.aydoHandle,
              discordName: adminUser.discordName || null,
              rsiAccountName: adminUser.rsiAccountName || null
            };
          }

          let user: User | null = null;

          // Try to find user by handle
          console.log(`AUTH: Looking for user with handle: ${credentials.aydoHandle}`);
          user = await userStorage.getUserByHandle(credentials.aydoHandle);

          if (!user) {
            console.log(`AUTH: No user found with handle: ${credentials.aydoHandle}`);
            return null;
          }

          console.log(`AUTH: User found:`, {
            id: user.id,
            aydoHandle: user.aydoHandle,
            email: user.email,
            hasPasswordHash: !!user.passwordHash,
            passwordHashLength: user.passwordHash ? user.passwordHash.length : 0
          });

          // Ensure the user has a passwordHash
          if (!user.passwordHash) {
            console.error('AUTH: User missing passwordHash:', user.aydoHandle);
            return null;
          }

          console.log('AUTH: Comparing password...');
          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
          console.log(`AUTH: Password valid: ${isPasswordValid}`);

          if (!isPasswordValid) {
            console.log(`AUTH: Invalid password for user: ${user.aydoHandle}`);
            return null;
          }

          console.log(`AUTH: Authentication successful for: ${user.aydoHandle}`);
          console.log(`AUTH: Using fallback storage: ${userStorage.isUsingFallbackStorage() ? 'Yes' : 'No'}`);
          
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
          console.error('AUTH: Authentication error:', error);
          throw new Error('Authentication error');
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      console.log('AUTH: signIn callback called', { 
        provider: account?.provider,
        userId: user.id, 
        email: user.email 
      });
      
      return true;
    },
    async jwt({ token, user, account }) {
      // Pass user details to the token when signing in
      if (user) {
        console.log('AUTH: jwt callback - adding user data to token');
        token.id = user.id;
        token.clearanceLevel = user.clearanceLevel;
        token.role = user.role;
        token.aydoHandle = user.aydoHandle;
        token.discordName = user.discordName;
        token.rsiAccountName = user.rsiAccountName;
      }
      return token;
    },
    async session({ session, token }) {
      // Pass token data to the client
      if (token && session.user) {
        console.log('AUTH: session callback - adding token data to session');
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
  debug: true, // Enable debug mode to see more NextAuth.js logs
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login?error=true',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
