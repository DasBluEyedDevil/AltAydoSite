import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  const prisma = new PrismaClient();
  
  try {
    console.log("Running query diagnostics");
    
    // Test results object
    const results = {
      connection: { success: false, error: null as string | null },
      rawQuery: { success: false, error: null as string | null, result: null as any },
      findFirst: { success: false, error: null as string | null, result: null as any },
      findMany: { success: false, error: null as string | null, count: 0 }
    };

    // Test 1: Basic connection
    try {
      await prisma.$queryRaw`SELECT 1 as connected`;
      results.connection.success = true;
    } catch (error) {
      results.connection.error = error instanceof Error ? error.message : 'Unknown error';
      console.error("Database connection test failed:", error);
    }

    // If connection failed, return early
    if (!results.connection.success) {
      await prisma.$disconnect();
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        results
      });
    }

    // Test 2: Raw SQL query to check User table structure
    try {
      const result = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        ORDER BY ordinal_position;
      `;
      results.rawQuery.success = true;
      results.rawQuery.result = result;
    } catch (error) {
      results.rawQuery.error = error instanceof Error ? error.message : 'Unknown error';
      console.error("Raw query test failed:", error);
    }

    // Test 3: Prisma findFirst - this mimics the behavior of findUnique in signup
    try {
      const user = await prisma.user.findFirst();
      results.findFirst.success = true;
      
      // Only return safe info if a user was found
      if (user) {
        results.findFirst.result = {
          id: user.id,
          email: user.email,
          aydoHandle: user.aydoHandle,
          createdAt: user.createdAt,
          // Don't return sensitive data
          hasPasswordHash: !!user.passwordHash
        };
      } else {
        results.findFirst.result = 'No users found';
      }
    } catch (error) {
      results.findFirst.error = error instanceof Error ? error.message : 'Unknown error';
      console.error("findFirst test failed:", error);
      
      // For debugging purposes, log full error details
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
          cause: (error as any).cause
        });
      }
    }

    // Test 4: Prisma count - check if we can at least count users
    try {
      const count = await prisma.user.count();
      results.findMany.success = true;
      results.findMany.count = count;
    } catch (error) {
      results.findMany.error = error instanceof Error ? error.message : 'Unknown error';
      console.error("findMany/count test failed:", error);
    }

    await prisma.$disconnect();
    
    // Determine the overall status
    const allSuccess = Object.values(results).every(result => result.success);
    
    return NextResponse.json({
      status: allSuccess ? 'success' : 'partial_failure',
      message: allSuccess 
        ? 'All query tests passed successfully' 
        : 'Some query tests failed',
      results,
      debug: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL 
          ? `${process.env.DATABASE_URL.split('://')[0]}://*****@${process.env.DATABASE_URL.split('@')[1] || 'unknown'}`
          : 'not set'
      }
    });
  } catch (error) {
    console.error("Query diagnostic error:", error);
    
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting from database:", disconnectError);
    }
    
    return NextResponse.json({
      status: 'error',
      message: 'Query diagnostic failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 