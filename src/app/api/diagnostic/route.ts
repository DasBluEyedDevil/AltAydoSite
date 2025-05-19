import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import * as userStorage from '@/lib/user-storage';

export async function GET() {
  try {
    // Update the fallback status
    userStorage.setFallbackStorageMode(true);
    
    // Check the fallback status
    const usingFallback = userStorage.isUsingFallbackStorage();
    console.log('DIAGNOSTIC: Fallback status:', usingFallback);
    
    // Check users from storage layer
    const users = await userStorage.getAllUsers();
    console.log(`DIAGNOSTIC: Found ${users.length} users via storage API`);
    
    // Now check the actual file directly
    const dataDir = path.join(process.cwd(), 'data');
    const usersFilePath = path.join(dataDir, 'users.json');
    
    let fileContent = 'File not found';
    let fileUsers = [];
    let fileExists = false;
    
    if (fs.existsSync(usersFilePath)) {
      fileExists = true;
      fileContent = fs.readFileSync(usersFilePath, 'utf8');
      try {
        fileUsers = JSON.parse(fileContent);
        console.log(`DIAGNOSTIC: Found ${fileUsers.length} users in JSON file`);
      } catch (parseError) {
        console.error('DIAGNOSTIC: Error parsing JSON file:', parseError);
        fileContent = 'Error parsing JSON: ' + (parseError as Error).message;
      }
    } else {
      console.log('DIAGNOSTIC: users.json file not found');
    }
    
    // Test finding a specific user by handle
    const testUser = await userStorage.getUserByHandle('testlogin');
    console.log('DIAGNOSTIC: Test user lookup result:', testUser ? 'Found' : 'Not found');
    
    return NextResponse.json({
      status: 'success',
      usingFallback,
      storageUsers: users.map(u => ({
        id: u.id,
        aydoHandle: u.aydoHandle,
        email: u.email
      })),
      fileExists,
      fileUserCount: fileUsers.length,
      fileUsers: fileUsers.map((u: any) => ({
        id: u.id,
        aydoHandle: u.aydoHandle,
        email: u.email,
        hasPasswordHash: !!u.passwordHash,
        passwordHashLength: u.passwordHash ? u.passwordHash.length : 0
      })),
      testUserLookup: testUser ? {
        id: testUser.id,
        aydoHandle: testUser.aydoHandle,
        email: testUser.email,
        hasPasswordHash: !!testUser.passwordHash,
        passwordHashLength: testUser.passwordHash ? testUser.passwordHash.length : 0
      } : null,
      cwd: process.cwd(),
      usersFilePath
    });
  } catch (error: any) {
    console.error('DIAGNOSTIC: Error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 