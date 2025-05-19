import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { authOptions } from '../auth/auth';
import * as userStorage from '@/lib/user-storage';

// Profile update validation schema
const profileUpdateSchema = z.object({
  discordName: z.string().optional().nullable(),
  rsiAccountName: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  photo: z.string().optional().nullable(),
  payGrade: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  division: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the user from storage
    const userId = session.user.id;
    const user = await userStorage.getUserById(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Return the profile data (excluding sensitive info)
    return NextResponse.json({
      id: user.id,
      aydoHandle: user.aydoHandle,
      email: user.email,
      discordName: user.discordName,
      rsiAccountName: user.rsiAccountName,
      bio: user.bio || null,
      photo: user.photo || null,
      payGrade: user.payGrade || null,
      position: user.position || null,
      division: user.division || null,
    });
    
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: `Failed to fetch profile: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const body = await request.json();
    
    // Validate request body
    const result = profileUpdateSchema.safeParse(body);
    if (!result.success) {
      const errorMessage = result.error.errors[0].message;
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    
    // Get validated data
    const updates = result.data;
    
    // Update the user profile
    const updatedUser = await userStorage.updateUser(userId, updates);
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
    
    // Return the updated profile data
    return NextResponse.json({
      id: updatedUser.id,
      aydoHandle: updatedUser.aydoHandle,
      email: updatedUser.email,
      discordName: updatedUser.discordName,
      rsiAccountName: updatedUser.rsiAccountName,
      bio: updatedUser.bio || null,
      photo: updatedUser.photo || null,
      payGrade: updatedUser.payGrade || null,
      position: updatedUser.position || null,
      division: updatedUser.division || null,
    });
    
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: `Failed to update profile: ${error.message}` },
      { status: 500 }
    );
  }
} 