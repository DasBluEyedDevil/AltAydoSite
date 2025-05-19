import { NextResponse } from 'next/server';
import * as userStorage from '@/lib/user-storage';

// Function to manually check all users and force fallback
async function forceLocalStorage() {
  try {
    // This will trigger fallback to local storage if Cosmos DB connection fails
    await userStorage.getAllUsers();
    
    // If we're already using fallback storage, no need to proceed
    if (userStorage.isUsingFallbackStorage()) {
      console.log('FORCE-FALLBACK: Already using fallback storage');
      return true;
    }
    
    // Attempt a bogus Cosmos DB operation to force fallback
    try {
      // @ts-ignore - Access private property to force fallback
      // eslint-disable-next-line
      const cosmosDb = require('@/lib/azure-cosmos');
      console.log('FORCE-FALLBACK: Attempting to trigger fallback by failing a Cosmos operation');
      await cosmosDb.getUserById('non-existent-id-to-force-error');
    } catch (error) {
      console.log('FORCE-FALLBACK: Successfully forced fallback to local storage');
      // @ts-ignore - Using private variable
      // eslint-disable-next-line
      global._usingFallbackStorage = true;
      return true;
    }
    
    return userStorage.isUsingFallbackStorage();
  } catch (error) {
    console.error('FORCE-FALLBACK: Error forcing fallback:', error);
    return false;
  }
}

export async function GET() {
  const wasUsingFallback = userStorage.isUsingFallbackStorage();
  
  try {
    // Force fallback to local storage explicitly
    userStorage.setFallbackStorageMode(true);
    
    // Now try to get users from local storage
    const localUsers = await userStorage.getAllUsers();
    
    return NextResponse.json({
      status: 'success',
      previouslyUsingFallback: wasUsingFallback,
      nowUsingFallback: userStorage.isUsingFallbackStorage(),
      userCount: localUsers.length,
      users: localUsers.map(user => ({
        id: user.id,
        aydoHandle: user.aydoHandle,
        email: user.email,
        role: user.role,
        hasPasswordHash: !!user.passwordHash,
        passwordHashLength: user.passwordHash ? user.passwordHash.length : 0
      }))
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: `Error forcing fallback: ${error.message}`,
      isUsingFallbackStorage: userStorage.isUsingFallbackStorage()
    }, { status: 500 });
  }
} 