import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Log environment variables (sanitized) for debugging
console.log('Database URL available:', !!process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Function to create a new Prisma client with better error handling
function createPrismaClient() {
  try {
    // Check DATABASE_URL format
    const dbUrl = process.env.DATABASE_URL || '';
    
    if (!dbUrl) {
      console.error('DATABASE_URL is not defined in environment variables');
      // Provide a fallback for build-time
      if (process.env.NODE_ENV === 'production') {
        console.log('Using fallback connection string for build-time');
        process.env.DATABASE_URL = "postgresql://postgres:IHateGeico1!@db.ohhnbxsbxzxyjgynxevi.supabase.co:5432/postgres";
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
          url: process.env.DATABASE_URL
        }
      }
    });
  } catch (error) {
    console.error('Failed to initialize PrismaClient:', error);
    throw new Error('Database connection failed');
  }
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

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

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 