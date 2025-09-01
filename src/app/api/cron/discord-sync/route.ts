import { NextRequest, NextResponse } from 'next/server';
import { syncAllUsersWithDiscord } from '@/lib/discord-user-sync';

// Force this API route to use Node.js runtime for discord.js compatibility
export const runtime = 'nodejs';

/**
 * GET /api/cron/discord-sync
 * Automated Discord user sync endpoint - designed to be called by cron jobs or external schedulers
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Automated Discord user sync started');
    
    // Optional: Add basic security with a cron secret
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      if (authHeader !== `Bearer ${cronSecret}`) {
        console.log('❌ Unauthorized cron request');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Run the sync
    const syncResult = await syncAllUsersWithDiscord();
    
    console.log('✅ Automated Discord sync completed:', {
      totalUsers: syncResult.totalUsers,
      matchedUsers: syncResult.matchedUsers,
      updatedUsers: syncResult.updatedUsers,
      errorCount: syncResult.errors.length
    });

    // Log any errors but don't fail the request
    if (syncResult.errors.length > 0) {
      console.warn('⚠️ Discord sync completed with errors:', syncResult.errors);
    }

    return NextResponse.json({
      success: true,
      message: 'Discord user sync completed',
      result: {
        totalUsers: syncResult.totalUsers,
        matchedUsers: syncResult.matchedUsers,
        updatedUsers: syncResult.updatedUsers,
        errorCount: syncResult.errors.length,
        // Don't include full error details or user data in automated response
        hasErrors: syncResult.errors.length > 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Automated Discord sync failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * POST /api/cron/discord-sync
 * Manual trigger for testing
 */
export async function POST(request: NextRequest) {
  // Same logic as GET for manual testing
  return GET(request);
}
