import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  try {
    // Create a new Prisma client instance
    const prisma = new PrismaClient();
    
    // Test the connection by attempting a simple query
    const testResult = await prisma.$queryRaw`SELECT 1 as connected`;
    
    // Get database connection information
    const connectionInfo = {
      provider: 'database',
      url: 'Connection string hidden for security',
      connected: Array.isArray(testResult) && testResult.length > 0 && testResult[0].connected === 1
    };
    
    // Clean up resources
    await prisma.$disconnect();
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
      connection: connectionInfo,
    });
  } catch (error: unknown) {
    console.error('Database connection test failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      error: {
        name: errorName,
        message: errorMessage,
        // Don't include stack trace in production
        ...(process.env.NODE_ENV !== 'production' && { stack: errorStack })
      }
    }, { status: 500 });
  }
} 