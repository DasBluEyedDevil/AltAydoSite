import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Log environment variables (sanitized) for debugging
console.log('Database URL available:', !!process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PHASE:', process.env.NEXT_PHASE);

// Create a mock client for static builds
const createMockPrismaClient = () => {
  console.log('Creating mock Prisma client for static build');
  // Return an object that mimics PrismaClient but doesn't connect to the database
  return {
    $connect: () => Promise.resolve(),
    $disconnect: () => Promise.resolve(),
    $queryRaw: () => Promise.resolve([{ result: 1 }]),
    $executeRaw: () => Promise.resolve(),
    $transaction: (fn: any) => Promise.resolve([]),
    user: {
      findUnique: () => Promise.resolve(null),
      findMany: () => Promise.resolve([]),
      findFirst: () => Promise.resolve(null),
      create: () => Promise.resolve({}),
      update: () => Promise.resolve({}),
      delete: () => Promise.resolve({}),
      count: () => Promise.resolve(0),
    },
    profile: {
      findUnique: () => Promise.resolve(null),
      findMany: () => Promise.resolve([]),
      findFirst: () => Promise.resolve(null),
      create: () => Promise.resolve({}),
      update: () => Promise.resolve({}),
      delete: () => Promise.resolve({}),
      count: () => Promise.resolve(0),
    },
  } as unknown as PrismaClient;
};

// Function to create a new Prisma client with better error handling
function createPrismaClient() {
  // During static build/export, use a mock client
  if (process.env.NEXT_PHASE === 'phase-export' || process.env.IS_STATIC_EXPORT === 'true') {
    return createMockPrismaClient();
  }

  try {
    // Check DATABASE_URL format
    let dbUrl = process.env.DATABASE_URL || '';

    // Handle mock connection string for static export
    if (!dbUrl || dbUrl === 'mock_connection_string_for_export') {
      console.error('DATABASE_URL is not defined or set to mock value');
      // Provide a fallback for build-time
      if (process.env.NODE_ENV === 'production') {
        console.log('Using fallback connection string for build-time');
        dbUrl = "postgresql://postgres:IHateGeico1!@db.ohhnbxsbxzxyjgynxevi.supabase.co:5432/postgres";
        // Only set the environment variable if it's not the mock string
        if (process.env.DATABASE_URL !== 'mock_connection_string_for_export') {
          process.env.DATABASE_URL = dbUrl;
        }
      }
    }

    if (!process.env.DATABASE_URL?.startsWith('postgresql://')) {
      console.error('Invalid DATABASE_URL format. Must start with postgresql://');
    }

    // Enhanced connection options
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],

      datasources: {
        db: {
          url: process.env.DATABASE_URL === 'mock_connection_string_for_export' ? dbUrl : process.env.DATABASE_URL
        }
      }
    });
  } catch (error) {
    console.error('Failed to initialize PrismaClient:', error);
    return createMockPrismaClient();
  }
}

// Set environment variable for static export
if (process.env.NEXT_PHASE === 'phase-export') {
  process.env.IS_STATIC_EXPORT = 'true';
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

// Avoid connection attempts during static export
if (process.env.NEXT_PHASE !== 'phase-export' && process.env.IS_STATIC_EXPORT !== 'true') {
  // Add global error handler for database connection issues
  // This uses a light connection test that doesn't impact performance
  try {
    // Use connection without a heavy query - just verify connection availability
    console.log('Testing Prisma client connectivity...');

    // Connect to the database
    prisma.$connect().then(() => {
      console.log('Prisma client initialized successfully with connection pooling');

      // Heartbeat check
      setInterval(async () => {
        try {
          // Check connection periodically
          await prisma.$queryRaw`SELECT 1`;
        } catch (error) {
          console.warn('Database heartbeat check failed:', error);
          // Reconnection will be automatic with next query
        }
      }, 60000); // 1 minute interval
    }).catch(error => {
      console.error('Database initial connection error:', error);
    });
  } catch (e) {
    console.error('Database setup error:', e);
  }
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 
