import { config } from 'aws-sdk';
import { PrismaClient } from '@prisma/client'
import { fromEnv } from '@aws-sdk/credential-providers';
import { getIniConfig } from '@aws-sdk/shared-ini-file-loader';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Set AWS region for IAM authentication
config.update({ region: 'us-east-1' });

// Configure AWS SDK to use available credentials
process.env.AWS_SDK_LOAD_CONFIG = '1';

// Function to create a new Prisma client with better error handling
function createPrismaClient() {
  try {
    // Enhanced connection options for AWS deployment
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      
      // Configurable connection timeout and pool settings
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
      
      // Connection pooling is handled automatically by Prisma
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
  prisma.$connect();
  
  // Heartbeat check
  setInterval(async () => {
    try {
      // Check connection periodically - useful for long-running apps that may lose connection
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      console.warn('Database heartbeat check failed:', error);
      // Reconnection will be automatic with next query
    }
  }, 60000); // 1 minute interval
} catch (e) {
  console.error('Database connection error:', e);
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 