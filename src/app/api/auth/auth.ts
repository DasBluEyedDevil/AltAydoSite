import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Create a singleton Prisma client to prevent multiple initializations
// Using global helps prevent multiple instances during hot reloading
const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

if (!globalForPrisma.prisma) {
  try {
    globalForPrisma.prisma = new PrismaClient();
  } catch (error) {
    console.error("Failed to initialize Prisma client:", error);
    // Fallback to prevent server crash
    globalForPrisma.prisma = {} as PrismaClient;
  }
}

prisma = globalForPrisma.prisma;

// Make sure the secret is set properly for all environments
if (!process.env.NEXTAUTH_SECRET) {
  console.warn('Missing NEXTAUTH_SECRET environment variable. Using fallback secret (not recommended for production)');
}

// Export auth options for use with getServerSession
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "AYDO Credentials",
      credentials: {
        aydoHandle: { label: "AydoCorp Handle", type: "text", placeholder: "aydo_pilot" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.aydoHandle || !credentials?.password) {
          return null;
        }

        try {
          // Check if Prisma is properly initialized
          if (!prisma.user) {
            console.error("Prisma client is not properly initialized");
            return null;
          }
          
          // Find the user by AydoCorp Handle
          const user = await prisma.user.findUnique({
            where: { aydoHandle: credentials.aydoHandle }
          });

          if (!user || !user.passwordHash) {
            return null;
          }
          
          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

          if (!isPasswordValid) {
            return null;
          }
          
          console.log("Auth provider: User authenticated successfully:", user.aydoHandle);
          
          // Return user without password
          return {
            id: user.id,
            email: user.email,
            name: user.aydoHandle,
            role: user.role,
            clearanceLevel: user.clearanceLevel,
            image: user.image || "/assets/avatar-placeholder.png"
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login?error=true',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      try {
        // Initial sign in
        if (account && user) {
          console.log("JWT callback: Initial sign in", user.name);
          return {
            ...token,
            id: user.id,
            role: user.role,
            clearanceLevel: user.clearanceLevel as number | undefined,
          };
        }
        
        // Return previous token on subsequent calls
        return token;
      } catch (error) {
        console.error("JWT callback error:", error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        if (session.user) {
          console.log("Session callback: Setting user data", token.name);
          session.user.id = token.id as string;
          session.user.role = token.role as string;
          session.user.clearanceLevel = token.clearanceLevel as number;
        }
        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },
  },
  // Set explicit secret configuration - make sure environment variable is prioritized
  secret: process.env.NEXTAUTH_SECRET || "c9c3fa66d0c46cfa96ef9b3dfbcb2f30b62cee09f33c9f16a1cc39993a7a1984",
  debug: true, // Enable debug mode in development to see detailed logs
  logger: {
    error(code, metadata) {
      console.error(`NextAuth error: ${code}`, metadata);
    },
    warn(code) {
      console.warn(`NextAuth warning: ${code}`);
    },
    debug(code, metadata) {
      console.log(`NextAuth debug: ${code}`, metadata);
    },
  },
  // Adjust session check frequency
  useSecureCookies: process.env.NODE_ENV === "production",
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 // 30 days
      }
    }
  }
};