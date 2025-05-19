import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import AzureADProvider from 'next-auth/providers/azure-ad';
import bcrypt from 'bcrypt';
import { User } from '@/types/user';
import { getUserByHandle, getUserByEmail } from '@/lib/azure-cosmos';

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
    // Microsoft Entra ID (Azure AD) Provider
    AzureADProvider({
      clientId: process.env.ENTRA_CLIENT_ID || '',
      clientSecret: process.env.ENTRA_CLIENT_SECRET || '',
      tenantId: process.env.ENTRA_TENANT_ID || '',
      authorization: {
        params: {
          scope: 'openid profile email User.Read'
        }
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          aydoHandle: profile.preferred_username?.split('@')[0] || profile.name,
          clearanceLevel: 1, // Default clearance level for new users
          role: 'user', // Default role for new users
          image: null,
          discordName: null,
          rsiAccountName: null
        };
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
        if (!credentials?.aydoHandle || !credentials?.password) {
          return null;
        }

        try {
          // Admin user special case - always allow admin login
          if (credentials.aydoHandle.toLowerCase() === 'admin') {
            console.log('Admin login attempt');
            const isPasswordValid = await bcrypt.compare(credentials.password, adminUser.passwordHash);

            if (!isPasswordValid) {
              console.log('Invalid admin password');
              return null;
            }

            console.log('Admin authentication successful');
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

          // Try to find user by handle in Azure Cosmos DB
          console.log(`Looking for user with handle in Cosmos DB: ${credentials.aydoHandle}`);
          user = await getUserByHandle(credentials.aydoHandle);

          if (!user) {
            console.log(`No user found with handle: ${credentials.aydoHandle}`);
            return null;
          }

          // Ensure the user has a passwordHash
          if (!user.passwordHash) {
            console.error('User missing passwordHash:', user.aydoHandle);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

          if (!isPasswordValid) {
            console.log(`Invalid password for user: ${user.aydoHandle}`);
            return null;
          }

          console.log(`Authentication successful for: ${user.aydoHandle}`);
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
          throw new Error('Authentication error');
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Azure AD sign-ins, we need to check if the user exists in our database
      if (account?.provider === 'azure-ad' && user.email) {
        try {
          // Check if user already exists in our database
          const existingUser = await getUserByEmail(user.email);
          
          if (!existingUser) {
            // This is a new user signing in with Azure AD
            // They will get default clearance and role as specified in the profile function
            console.log(`New Azure AD user: ${user.email}`);
          } else {
            // Update user data with existing clearance and role from our database
            console.log(`Existing Azure AD user: ${user.email}`);
            user.clearanceLevel = existingUser.clearanceLevel;
            user.role = existingUser.role;
            
            // Copy other properties if they exist
            if (existingUser.discordName) user.discordName = existingUser.discordName;
            if (existingUser.rsiAccountName) user.rsiAccountName = existingUser.rsiAccountName;
          }
        } catch (error) {
          console.error('Error during Azure AD sign-in:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Pass user details to the token when signing in
      if (user) {
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
