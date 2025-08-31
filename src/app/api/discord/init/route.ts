import { NextRequest, NextResponse } from 'next/server';
import { initializeDiscordRoleMonitor } from '@/lib/discord-role-monitor-init';

// This endpoint can be called to initialize the Discord role monitor
// It's designed to be called once when the application starts
export async function POST(request: NextRequest) {
  try {
    // Basic security check - you might want to add authentication here
    const { secret } = await request.json();
    
    if (secret !== process.env.INIT_SECRET) {
      return NextResponse.json(
        { error: 'Invalid secret' },
        { status: 401 }
      );
    }

    initializeDiscordRoleMonitor();

    return NextResponse.json({
      message: 'Discord role monitor initialization attempted',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error initializing Discord role monitor via API:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to initialize'
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    message: 'Discord role monitor initialization endpoint',
    timestamp: new Date().toISOString()
  });
}
