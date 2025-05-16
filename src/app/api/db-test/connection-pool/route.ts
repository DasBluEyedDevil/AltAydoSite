import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  // During static export, return mock data
  if (process.env.IS_STATIC_EXPORT === 'true' || process.env.NEXT_PHASE === 'phase-export') {
    return NextResponse.json({
      message: 'Mock database response for static export',
      status: 'mock'
    });
  }

  try {
    // This query is intentionally simple to test the connection, not to return meaningful data
    const result = await prisma.$queryRaw`SELECT current_timestamp`;
    
    return NextResponse.json({
      message: 'Database connection pool is working',
      timestamp: result,
      status: 'success'
    });
  } catch (error) {
    console.error('Database connection pool test failed:', error);
    
    return NextResponse.json({
      message: 'Database connection pool test failed',
      error: String(error),
      status: 'error'
    }, { status: 500 });
  }
} 