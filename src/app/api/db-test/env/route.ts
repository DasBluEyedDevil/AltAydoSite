import { NextResponse } from 'next/server';

type EnvVarStatus = { exists: boolean; masked?: string };

// Function to safely check if an environment variable exists without exposing its value
const checkEnvVariable = (name: string): EnvVarStatus => {
  const value = process.env[name];
  if (!value) {
    return { exists: false };
  }
  
  // Mask the value for security but show some info to help debugging
  if (name.toLowerCase().includes('url')) {
    try {
      // For URLs, show protocol and hostname only
      const url = new URL(value);
      return { 
        exists: true, 
        masked: `${url.protocol}//${url.hostname}:****` 
      };
    } catch {
      // If not a valid URL, just show that it exists
      return { exists: true, masked: '********' };
    }
  }
  
  // For other variables, just indicate they exist
  return { exists: true, masked: '********' };
};

export async function GET() {
  try {
    // Check required environment variables
    const envStatus: Record<string, EnvVarStatus | string> = {
      DATABASE_URL: checkEnvVariable('DATABASE_URL'),
      NEXTAUTH_SECRET: checkEnvVariable('NEXTAUTH_SECRET'),
      NEXTAUTH_URL: checkEnvVariable('NEXTAUTH_URL'),
      NODE_ENV: process.env.NODE_ENV || 'not set',
      VERCEL_ENV: process.env.VERCEL_ENV || 'not set',
      AWS_REGION: process.env.AWS_REGION || 'not set'
    };
    
    // Check if any critical variables are missing
    const missingVars = Object.entries(envStatus)
      .filter(([key, value]) => 
        (key === 'DATABASE_URL' || key === 'NEXTAUTH_SECRET') && 
        typeof value !== 'string' && !value.exists
      )
      .map(([key]) => key);
    
    return NextResponse.json({
      status: missingVars.length > 0 ? 'warning' : 'success',
      message: missingVars.length > 0 
        ? `Missing critical environment variables: ${missingVars.join(', ')}` 
        : 'All critical environment variables are set',
      environment: process.env.NODE_ENV || 'unknown',
      variables: envStatus,
      prismaAvailable: typeof require('@prisma/client') !== 'undefined',
      timestamp: new Date().toISOString()
    });
  } catch (error: unknown) {
    console.error('Environment check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check environment variables',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 