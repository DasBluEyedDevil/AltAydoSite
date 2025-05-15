import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Create a singleton Prisma client to prevent multiple initializations
// Using global helps prevent multiple instances during hot reloading
const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

if (!globalForPrisma.prisma) {
  try {
    globalForPrisma.prisma = new PrismaClient();
  } catch (error) {
    console.error("Failed to initialize Prisma client:", error);
    // Fallback to prevent server crash
    globalForPrisma.prisma = {} as PrismaClient;
  }
}

prisma = globalForPrisma.prisma;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { aydoHandle, email, discordName, rsiAccountName, password } = body;

    // Validate required fields
    if (!aydoHandle || !email || !password) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    const existingUserByHandle = await prisma.user.findUnique({
      where: { aydoHandle }
    });

    if (existingUserByHandle) {
      return NextResponse.json(
        { error: 'AydoCorp Handle already in use' },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new user with clearance level 1 by default
    const newUser = await prisma.user.create({
      data: {
        aydoHandle,
        email,
        discordName: discordName || null,
        rsiAccountName: rsiAccountName || null,
        passwordHash,
        clearanceLevel: 1
      }
    });

    // Return user without password
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 
