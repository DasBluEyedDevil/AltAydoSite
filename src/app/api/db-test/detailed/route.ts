import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  const prisma = new PrismaClient();
  const results = {
    connection: { success: false, error: null as string | null },
    userTable: { success: false, count: 0, error: null as string | null },
    schemaValidation: { success: false, error: null as string | null }
  };

  try {
    // Test 1: Basic connection
    try {
      const connectionTest = await prisma.$queryRaw`SELECT 1 as connected`;
      results.connection.success = Array.isArray(connectionTest) && 
        connectionTest.length > 0 && 
        connectionTest[0].connected === 1;
    } catch (error: unknown) {
      results.connection.error = error instanceof Error ? error.message : 'Unknown connection error';
    }

    // Test 2: User table query
    try {
      if (results.connection.success) {
        const userCount = await prisma.user.count();
        results.userTable.success = true;
        results.userTable.count = userCount;
      }
    } catch (error: unknown) {
      results.userTable.error = error instanceof Error ? error.message : 'User table query failed';
    }

    // Test 3: Schema validation
    try {
      if (results.connection.success) {
        // Validate schema by checking if a required table/column exists
        await prisma.$queryRaw`SELECT "id", "email", "aydoHandle", "passwordHash" FROM "User" LIMIT 1`;
        results.schemaValidation.success = true;
      }
    } catch (error: unknown) {
      results.schemaValidation.error = error instanceof Error ? error.message : 'Schema validation failed';
    }

    // Clean up resources
    await prisma.$disconnect();
    
    // Determine overall status
    const allSuccessful = Object.values(results).every(test => test.success);
    
    return NextResponse.json({
      status: allSuccessful ? 'success' : 'partial_failure',
      message: allSuccessful 
        ? 'All database tests passed successfully' 
        : 'Some database tests failed',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      databaseUrl: process.env.DATABASE_URL 
        ? `${process.env.DATABASE_URL.split('://')[0]}://*****` 
        : 'Not configured',
      results
    });
  } catch (error: unknown) {
    console.error('Database detailed test failed:', error);
    
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
    
    return NextResponse.json({
      status: 'error',
      message: 'Database detailed test failed with an unexpected error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      } : 'Unknown error'
    }, { status: 500 });
  }
} 