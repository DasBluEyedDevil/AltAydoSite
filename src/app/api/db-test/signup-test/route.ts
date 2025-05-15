import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

export async function GET() {
  const prisma = new PrismaClient();
  
  try {
    console.log("Testing exact signup flow");
    
    // Generate unique test data
    const timestamp = Date.now();
    const testHandle = `test_handle_${timestamp}`;
    const testEmail = `test_email_${timestamp}@example.com`;
    const testPassword = 'TestPassword123!';
    
    // Test results object
    const results = {
      connection: { success: false, error: null as string | null },
      hashPassword: { success: false, error: null as string | null },
      createUser: { success: false, error: null as string | null, userId: null as string | null },
      cleanup: { success: false, error: null as string | null }
    };

    // Step 1: Test connection
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
        success: false,
        message: 'Database connection failed',
        results
      });
    }

    // Step 2: Test password hashing (like in signup)
    let passwordHash;
    try {
      const saltRounds = 10;
      passwordHash = await bcrypt.hash(testPassword, saltRounds);
      results.hashPassword.success = true;
    } catch (error) {
      results.hashPassword.error = error instanceof Error ? error.message : 'Unknown error';
      console.error("Password hashing failed:", error);
    }

    // If hashing failed, return early
    if (!results.hashPassword.success) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false, 
        message: 'Password hashing failed',
        results
      });
    }

    // Step 3: Test user creation with exact same fields as signup
    try {
      // Ensure passwordHash is not undefined
      if (!passwordHash) {
        throw new Error("Password hash is undefined");
      }
      
      const newUser = await prisma.user.create({
        data: {
          aydoHandle: testHandle,
          email: testEmail,
          passwordHash: passwordHash, // Explicitly assign to avoid TypeScript error
          clearanceLevel: 1,
          role: 'member',
          discordName: 'test_discord',
          rsiAccountName: 'test_rsi'
        }
      });
      
      results.createUser.success = true;
      results.createUser.userId = newUser.id;
      console.log(`Test user created with ID: ${newUser.id}`);
    } catch (error) {
      results.createUser.error = error instanceof Error ? error.message : 'Unknown error';
      
      // Add additional error info for Prisma errors
      if (error instanceof Error && 'code' in (error as any)) {
        const errorCode = (error as any).code;
        console.error("Prisma error code:", errorCode);
        if (typeof errorCode === 'string') {
          results.createUser.error = `${results.createUser.error} (Code: ${errorCode})`;
        }
      }
      
      console.error("User creation failed:", error);
    }

    // Step 4: Clean up - Delete test user if it was created
    if (results.createUser.success && results.createUser.userId) {
      try {
        await prisma.user.delete({
          where: { id: results.createUser.userId }
        });
        results.cleanup.success = true;
        console.log("Test user deleted successfully");
      } catch (error) {
        results.cleanup.error = error instanceof Error ? error.message : 'Unknown error';
        console.error("Cleanup failed:", error);
      }
    } else {
      // No user to clean up
      results.cleanup.success = true;
    }

    await prisma.$disconnect();
    
    // Overall success depends on whether user creation worked
    const success = results.createUser.success;
    
    return NextResponse.json({
      success,
      message: success ? 'Signup simulation successful' : 'Signup simulation failed',
      results,
      recommendations: !success ? [
        "Check if any validation in your signup form is preventing user creation",
        "Verify that the form data is being properly formatted and sent to the API",
        "Look for any unique constraints that might be violated in your user creation",
        "Check for typos in field names between your form and the API",
      ] : []
    });
    
  } catch (error) {
    console.error("Signup test failed:", error);
    
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting from database:", disconnectError);
    }
    
    return NextResponse.json({
      success: false,
      message: 'Signup test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 