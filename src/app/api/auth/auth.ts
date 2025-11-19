import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import DiscordProvider from 'next-auth/providers/discord';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { User } from '@/types/user';
import * as userStorage from '@/lib/user-storage';
import { syncDiscordProfile } from '@/lib/discord-oauth';

// SECURITY FIX: Hardcoded admin user removed for production security
// Admin users must be created in the database with secure, unique passwords
// Never hardcode credentials in source code

export const authOptions: NextAuthOptions = {
  providers: [
    // Discord OAuth Provider
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'identify email guilds.members.read'
        }
      }
    }),
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
    async signIn({ user, account, profile }) {
      console.log('AUTH: signIn callback called', { 
        provider: account?.provider,
        userId: user.id, 
        email: user.email 
      });

      // Handle Discord OAuth sign in
      if (account?.provider === 'discord') {
        console.log('AUTH: Discord OAuth sign in detected');
        
        try {
          // Sync Discord profile data (roles, division, position)
          const discordProfile = profile as any;
          const discordProfileData = await syncDiscordProfile(
            account.access_token || '',
            user.id,
            discordProfile.username || user.name || 'discord_user'
          );

          // Check if user already exists by Discord ID
          let existingUser = await userStorage.getUserByDiscordId(user.id);
          
          if (!existingUser) {
            // Check if user exists by email
            existingUser = await userStorage.getUserByEmail(user.email || '');
          }

          if (existingUser) {
            // Update existing user with Discord info including roles
            console.log('AUTH: Updating existing user with Discord data and roles');
            await userStorage.updateUser(existingUser.id, {
              discordId: user.id,
              discordName: `${discordProfile.username}#${discordProfile.discriminator}`,
              discordAvatar: user.image || null,
              email: user.email || existingUser.email,
              division: discordProfileData.division || existingUser.division,
              position: discordProfileData.position || existingUser.position,
              payGrade: discordProfileData.payGrade || existingUser.payGrade,
              updatedAt: new Date().toISOString()
            });
          } else {
            // Create new user from Discord profile including roles
            console.log('AUTH: Creating new user from Discord profile with roles');
            const newUser: User = {
              id: crypto.randomUUID(),
              aydoHandle: discordProfileData.displayName || discordProfile.username || user.name || 'discord_user',
              email: user.email || '',
              passwordHash: '', // No password for OAuth users
              clearanceLevel: 1,
              role: 'user',
              discordId: user.id,
              discordName: `${discordProfile.username}#${discordProfile.discriminator}`,
              discordAvatar: user.image || null,
              division: discordProfileData.division,
              position: discordProfileData.position,
              payGrade: discordProfileData.payGrade,
              rsiAccountName: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            await userStorage.createUser(newUser);
            console.log('AUTH: New Discord user created with roles:', {
              id: newUser.id,
              division: newUser.division,
              position: newUser.position,
              payGrade: newUser.payGrade
            });
          }
        } catch (error) {
          console.error('AUTH: Error handling Discord sign in:', error);
          return false;
        }
      }
      
      return true;
    },
    async jwt({ token, user, account }) {
      const now = Date.now();
      const tokenMaxAge = 60 * 60 * 1000; // 1 hour in milliseconds

      // Initial sign-in
      if (user && account) {
        console.log('AUTH: jwt callback - initial sign-in');
        token.id = user.id;
        token.clearanceLevel = user.clearanceLevel;
        token.role = user.role;
        token.aydoHandle = user.aydoHandle;
        token.discordName = user.discordName;
        token.discordId = user.discordId;
        token.discordAvatar = user.discordAvatar;
        token.rsiAccountName = user.rsiAccountName;
        token.lastUpdated = now;
        return token;
      }

      // If token exists and is not expired, return it
      if (token && (now < (token.lastUpdated as number) + tokenMaxAge)) {
        return token;
      }

      // If token is expired or needs to be refreshed
      if (token && token.id) {
        console.log('AUTH: jwt callback - refreshing token');
        try {
          const latestUser = await userStorage.getUserById(token.id as string);
          if (latestUser) {
            token.clearanceLevel = latestUser.clearanceLevel;
            token.role = latestUser.role;
            token.aydoHandle = latestUser.aydoHandle;
            token.discordName = latestUser.discordName || null;
            token.discordId = latestUser.discordId || null;
            token.discordAvatar = latestUser.discordAvatar || null;
            token.rsiAccountName = latestUser.rsiAccountName || null;
            token.lastUpdated = now;
          }
        } catch (e) {
          console.warn('AUTH: jwt callback - failed to refresh user from storage:', e);
        }
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
        session.user.discordId = token.discordId as string | null;
        session.user.discordAvatar = token.discordAvatar as string | null;
        session.user.rsiAccountName = token.rsiAccountName as string | null;
        
        // Set display name to AydoCorp handle for consistent display
        session.user.name = token.aydoHandle as string;
      }
      return session;
    }
  },
  debug: process.env.NODE_ENV !== 'production',
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
