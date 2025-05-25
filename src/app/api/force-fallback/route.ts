import { NextResponse } from 'next/server';
import * as userStorage from '@/lib/user-storage';
import { connectToDatabase } from '@/lib/mongodb';

// Function to manually check MongoDB connection and force fallback
async function forceLocalStorage() {
  try {
    // This will trigger fallback to local storage if MongoDB connection fails
    await userStorage.getAllUsers();
    
    // If we're already using fallback storage, no need to proceed
    if (userStorage.isUsingFallbackStorage()) {
      console.log('FORCE-FALLBACK: Already using fallback storage');
      return true;
    }
    
    // Attempt a MongoDB operation to force fallback
    try {
      const { db } = await connectToDatabase();
      console.log('FORCE-FALLBACK: Attempting to trigger fallback by checking MongoDB connection');
      await db.command({ ping: 1 });
      return false; // If we get here, MongoDB is working
    } catch (error) {
      console.log('FORCE-FALLBACK: Successfully forced fallback to local storage');
      // @ts-ignore - Using private variable
      // eslint-disable-next-line
      global._usingFallbackStorage = true;
      return true;
    }
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