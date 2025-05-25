import { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';
import { compare } from 'bcryptjs';

// Extend the built-in types
declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    clearanceLevel: string;
    role: string;
    aydoHandle: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      clearanceLevel: string;
      role: string;
      aydoHandle: string;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    clearanceLevel: string;
    role: string;
    aydoHandle: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        aydoHandle: { label: "AydoCorp Handle", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('Starting authorization for handle:', credentials?.aydoHandle);
          
          if (!credentials?.aydoHandle || !credentials?.password) {
            console.error('Authorization failed: Missing credentials');
            throw new Error('Missing credentials');
          }

          const { db } = await connectToDatabase();
          console.log('Database connection established');
          
          const user = await db.collection('users').findOne({ 
            aydoHandle: credentials.aydoHandle 
          });

          if (!user) {
            console.error('Authorization failed: No user found for handle:', credentials.aydoHandle);
            throw new Error('No user found');
          }

          console.log('User found, verifying password');
          const isValid = await compare(credentials.password, user.password);

          if (!isValid) {
            console.error('Authorization failed: Invalid password for handle:', credentials.aydoHandle);
            throw new Error('Invalid password');
          }

          console.log('Authorization successful for handle:', credentials.aydoHandle);
          return {
            id: user._id.toString(),
            name: user.username || user.aydoHandle,
            email: user.email,
            clearanceLevel: user.clearanceLevel || 'default',
            role: user.role || 'member',
            aydoHandle: user.aydoHandle
          };
        } catch (error) {
          console.error('Authorization error:', error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.clearanceLevel = user.clearanceLevel;
        token.role = user.role;
        token.aydoHandle = user.aydoHandle;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.clearanceLevel = token.clearanceLevel;
        session.user.role = token.role;
        session.user.aydoHandle = token.aydoHandle;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };