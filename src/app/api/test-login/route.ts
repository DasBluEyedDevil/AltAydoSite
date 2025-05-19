import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import * as userStorage from '@/lib/user-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.aydoHandle || !body.password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Both aydoHandle and password are required' 
      }, { status: 400 });
    }
    
    console.log(`TEST-LOGIN: Checking credentials for: ${body.aydoHandle}`);
    
    // Try to find the user
    const user = await userStorage.getUserByHandle(body.aydoHandle);
    
    if (!user) {
      console.log(`TEST-LOGIN: User not found: ${body.aydoHandle}`);
      return NextResponse.json({ 
        success: false, 
        message: 'User not found',
        fallbackStorage: userStorage.isUsingFallbackStorage()
      }, { status: 404 });
    }
    
    console.log(`TEST-LOGIN: User found, checking password for: ${body.aydoHandle}`);
    
    // Make sure user has a passwordHash
    if (!user.passwordHash) {
      console.log(`TEST-LOGIN: User has no password hash: ${body.aydoHandle}`);
      return NextResponse.json({ 
        success: false, 
        message: 'User account is not configured for password login',
        fallbackStorage: userStorage.isUsingFallbackStorage()
      });
    }
    
    // Check password
    const passwordValid = await bcrypt.compare(body.password, user.passwordHash);
    
    console.log(`TEST-LOGIN: Password validation result for ${body.aydoHandle}: ${passwordValid ? 'Valid' : 'Invalid'}`);
    
    return NextResponse.json({
      success: passwordValid,
      message: passwordValid ? 'Login would succeed' : 'Invalid password',
      userData: {
        id: user.id,
        aydoHandle: user.aydoHandle,
        email: user.email,
        role: user.role,
        clearanceLevel: user.clearanceLevel
      },
      hasPasswordHash: !!user.passwordHash,
      passwordHashLength: user.passwordHash ? user.passwordHash.length : 0,
      fallbackStorage: userStorage.isUsingFallbackStorage()
    });
  } catch (error: any) {
    console.error('TEST-LOGIN: Error testing login:', error);
    return NextResponse.json({ 
      success: false, 
      message: `Error: ${error.message}`,
      fallbackStorage: userStorage.isUsingFallbackStorage()
    }, { status: 500 });
  }
} 