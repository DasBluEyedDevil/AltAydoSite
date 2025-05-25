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
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        const { db } = await connectToDatabase();
        
        const user = await db.collection('users').findOne({ 
          username: credentials.username 
        });

        if (!user) {
          throw new Error('No user found');
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          name: user.username,
          email: user.email,
          clearanceLevel: user.clearanceLevel || 'default',
          role: user.role || 'member',
          aydoHandle: user.aydoHandle || user.username
        };
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