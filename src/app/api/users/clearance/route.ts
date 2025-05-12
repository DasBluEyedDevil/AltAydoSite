import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PrismaClient } from '@prisma/client';
import { isAdmin } from '../../../../lib/auth';

const prisma = new PrismaClient();

// GET - Retrieve users with their clearance levels
export async function GET(request: Request) {
  try {
    // Check if user is authenticated and has admin rights
    const session = await getServerSession();
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: 'Unauthorized. Requires clearance level 3.' },
        { status: 403 }
      );
    }

    // Get users with their clearance levels
    const users = await prisma.user.findMany({
      select: {
        id: true,
        aydoHandle: true,
        email: true,
        clearanceLevel: true,
        role: true,
        createdAt: true,
        discordName: true,
        rsiAccountName: true
      },
      orderBy: {
        clearanceLevel: 'desc'
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// PUT - Update a user's clearance level
export async function PUT(request: Request) {
  try {
    // Check if user is authenticated and has admin rights
    const session = await getServerSession();
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