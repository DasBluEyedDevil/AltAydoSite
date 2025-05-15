import { config } from 'aws-sdk';
import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Set AWS region for IAM authentication
config.update({ 
  region: 'us-east-1'
  // Credentials will be automatically loaded from the environment
  // In AWS Amplify, the instance role provides credentials
});

// Configure AWS SDK to use available credentials
process.env.AWS_SDK_LOAD_CONFIG = '1';

// Function to create a new Prisma client with better error handling
function createPrismaClient() {
  try {
    // Check DATABASE_URL format
    const dbUrl = process.env.DATABASE_URL || '';
    
    if (!dbUrl.startsWith('postgresql://')) {
      console.error('Invalid DATABASE_URL format. Must start with postgresql://');
    }
    
    if (dbUrl.includes('aws_auth=true')) {
      console.log('Using AWS IAM authentication for database connection');
      
      // Make sure we have the region in the URL
      if (!dbUrl.includes('aws_region=')) {
        console.log('Adding AWS region to DATABASE_URL');
        
        // Add region parameter if not present
        const separator = dbUrl.includes('?') ? '&' : '?';
        process.env.DATABASE_URL = `${dbUrl}${separator}aws_region=us-east-1`;
      }
    }
    
    // Enhanced connection options for AWS deployment
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      
      // Configurable connection timeout and pool settings
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
        // Check connection periodically with proper template literal syntax
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