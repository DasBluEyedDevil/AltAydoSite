import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { User } from '@/types/user';

// Local storage for users
const dataDir = path.join(process.cwd(), 'data');
const usersFilePath = path.join(dataDir, 'users.json');

// Helper function to read users from local storage
const getLocalUsers = (): User[] => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([]), 'utf8');
    return [];
  }

  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data) as User[];
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
};

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

          // Try local storage
          console.log(`Looking for user with handle in local storage: ${credentials.aydoHandle}`);
          const localUsers = getLocalUsers();
          const localUser = localUsers.find(u => 
            u.aydoHandle.toLowerCase() === credentials.aydoHandle.toLowerCase()
          );

          if (localUser) {
            user = localUser;
            console.log(`User found in local storage: ${user.aydoHandle}`);
          }

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
