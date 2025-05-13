import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Function to create a new Prisma client with error handling
function createPrismaClient() {
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  } catch (error) {
    console.error('Failed to initialize PrismaClient:', error);
    throw new Error('Database connection failed');
  }
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

// Add global error handler for database connection issues (if needed)
try {
  // Ensure database connection is working by running a simple query
  prisma.$connect();
} catch (e) {
  console.error('Database connection error:', e);
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 