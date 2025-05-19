import { NextResponse } from 'next/server';
import * as userStorage from '@/lib/user-storage';

export async function GET() {
  try {
    // Try to access the storage
    const users = await userStorage.getAllUsers();
    
    return NextResponse.json({
      status: 'success',
      isUsingFallbackStorage: userStorage.isUsingFallbackStorage(),
      userCount: users.length,
      message: userStorage.isUsingFallbackStorage() 
        ? 'Using local file storage (fallback mode)'
        : 'Using Azure Cosmos DB'
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: `Error accessing storage: ${error.message}`,
      isUsingFallbackStorage: userStorage.isUsingFallbackStorage()
    }, { status: 500 });
  }
} 