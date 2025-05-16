import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { isAdmin } from '@/lib/auth';
import { authOptions } from '../../auth/auth';

const prisma = new PrismaClient();

// This route is disabled during static export
export async function GET() {
  // Simplified static response to make export work
  return NextResponse.json({
    message: 'API routes are not available in static export',
    disabled: true
  });
}

// PUT - Update a user's clearance level
export async function PUT(request: Request) {
  try {
    // Check if user is authenticated and has admin rights
    const session = await getServerSession(authOptions);
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: 'Unauthorized. Requires clearance level 3.' },
        { status: 403 }
      );
    }

    const { userId, clearanceLevel } = await request.json();

    if (!userId || clearanceLevel === undefined || clearanceLevel === null) {
      return NextResponse.json(
        { error: 'User ID and clearance level are required' },
        { status: 400 }
      );
    }

    // Validate clearance level (must be 1, 2, or 3)
    if (![1, 2, 3].includes(clearanceLevel)) {
      return NextResponse.json(
        { error: 'Clearance level must be 1, 2, or 3' },
        { status: 400 }
      );
    }

    // Update user's clearance level
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { clearanceLevel },
      select: {
        id: true,
        aydoHandle: true,
        email: true,
        clearanceLevel: true,
        role: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user clearance:', error);
    return NextResponse.json(
      { error: 'Failed to update user clearance level' },
      { status: 500 }
    );
  }
} 
