import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  const prisma = new PrismaClient();
  
  try {
    console.log("Testing database INSERT permissions");
    
    // First check basic connection
    const connected = await prisma.$queryRaw`SELECT 1 as connected`;
    
    if (!connected) {
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        message: 'Database connection failed',
        canInsert: false,
        error: 'Could not connect to database'
      });
    }
    
    // Try to create a temporary user record
    try {
      const tempId = `temp_${Date.now()}`;
      const tempEmail = `temp_${Date.now()}@test.com`;
      const tempHandle = `temp_${Date.now()}`;
      
      // Attempt to insert a record
      const testUser = await prisma.user.create({
        data: {
          id: tempId,
          email: tempEmail,
          aydoHandle: tempHandle,
          passwordHash: 'temporary_hash_for_testing',
          role: 'member',
          clearanceLevel: 1
        }
      });
      
      console.log("Successfully inserted test record");
      
      // If successful, immediately delete the test record
      await prisma.user.delete({
        where: { id: tempId }
      });
      
      console.log("Successfully deleted test record");
      
      await prisma.$disconnect();
      return NextResponse.json({
        success: true,
        message: 'Database INSERT permission test passed',
        canInsert: true
      });
      
    } catch (error) {
      console.error("Error testing INSERT permission:", error);
      
      await prisma.$disconnect();
      return NextResponse.json({
        success: false,
        message: 'Database INSERT permission test failed',
        canInsert: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        ...(error instanceof Error && 'code' in (error as any) ? { errorCode: (error as any).code } : {})
      });
    }
  } catch (error) {
    console.error("Database permission test error:", error);
    
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting from database:", disconnectError);
    }
    
    return NextResponse.json({
      success: false,
      message: 'Database permission test failed',
      canInsert: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 