import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth';
import * as userStorage from '@/lib/user-storage';

// GET handler - List users (basic info only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get all users
    const users = await userStorage.getAllUsers();
    
    // Map to return only necessary info
    const usersList = users.map(user => ({
      id: user.id,
      aydoHandle: user.aydoHandle,
      role: user.role,
      division: user.division || null,
      position: user.position || null,
      ships: user.ships || []
    }));
    
    return NextResponse.json(usersList);
    
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: `Failed to fetch users: ${error.message}` },
      { status: 500 }
    );
  }
} 