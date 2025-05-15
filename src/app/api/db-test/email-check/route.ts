import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET(request: Request) {
  const prisma = new PrismaClient();
  
  try {
    console.log("Testing email check functionality");
    
    // Generate unique test email
    const timestamp = Date.now();
    const testEmail = `test_email_${timestamp}@example.com`;
    
    // Results object
    const results = {
      connection: { success: false, error: null as string | null },
      rawQuery: { success: false, error: null as string | null },
      emailCheck: { success: false, error: null as string | null },
      clientInfo: { success: false, error: null as string | null }
    };
    
    // Step 1: Test basic connection
    try {
      await prisma.$queryRaw`SELECT 1 as connected`;
      results.connection.success = true;
      console.log("Database connection successful");
    } catch (error) {
      results.connection.error = error instanceof Error ? error.message : 'Unknown error';
      console.error("Database connection test failed:", error);
    }
    
    // If connection failed, return early
    if (!results.connection.success) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        message: 'Database connection failed',
        results
      });
    }
    
    // Step 2: Try a raw query to check if the User table exists and has email column
    try {
      const tableCheck = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'User' 
        AND column_name = 'email'
      `;
      
      results.rawQuery.success = true;
      console.log("Raw query to check email column successful:", tableCheck);
    } catch (error) {
      results.rawQuery.error = error instanceof Error ? error.message : 'Unknown error';
      console.error("Raw query test failed:", error);
    }
    
    // Step 3: Test the exact email check that fails in signup
    try {
      // Test with a completely new random email
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: testEmail }
      });
      
      results.emailCheck.success = true;
      console.log("Email check successful, result:", existingUserByEmail === null ? "No user found (expected)" : "User found (unexpected)");
    } catch (error) {
      results.emailCheck.error = error instanceof Error ? error.message : 'Unknown error';
      console.error("Email check failed:", error);
      
      // Add additional error info for Prisma errors
      if (error instanceof Error && 'code' in (error as any)) {
        const errorCode = (error as any).code;
        console.error("Prisma error code:", errorCode);
        if (typeof errorCode === 'string') {
          results.emailCheck.error = `${results.emailCheck.error} (Code: ${errorCode})`;
        }
      }
    }
    
    // Step 4: Get Prisma client info for debugging
    try {
      const version = await prisma.$queryRaw`SELECT version()`;
      results.clientInfo.success = true;
      console.log("Database version:", version);
    } catch (error) {
      results.clientInfo.error = error instanceof Error ? error.message : 'Unknown error';
      console.error("Client info check failed:", error);
    }
    
    await prisma.$disconnect();
    
    // Overall result
    const success = results.emailCheck.success;
    
    return NextResponse.json({
      success,
      message: success ? 'Email check functionality works correctly' : 'Email check functionality failed',
      results,
      recommendations: !success ? [
        "Check if your Prisma schema email field matches the database schema exactly",
        "Verify that the 'email' column in the User table has the correct case sensitivity settings",
        "Check for any database indexes or constraints that might be causing issues",
        "Consider regenerating Prisma client with 'npx prisma generate'",
        "Look for connection pooling issues or connection limits"
      ] : []
    });
    
  } catch (error) {
    console.error("Email check test failed:", error);
    
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting from database:", disconnectError);
    }
    
    return NextResponse.json({
      success: false,
      message: 'Email check test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 