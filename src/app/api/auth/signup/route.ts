import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/db';

// Validation schema for user registration
const userSchema = z.object({
  email: z.string().email("Invalid email format"),
  aydoHandle: z.string().min(3, "Handle must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  discordName: z.string().optional(),
  rsiAccountName: z.string().optional(),
});

export async function POST(request: Request) {
  // For static export, return mock response
  if (process.env.IS_STATIC_EXPORT === 'true' || process.env.NEXT_PHASE === 'phase-export') {
    return NextResponse.json({
      success: true,
      message: "Mock signup response for static build",
    });
  }

  try {
    const body = await request.json();

    // Validate input
    const result = userSchema.safeParse(body);
    if (!result.success) {
      const { errors } = result.error;
      return NextResponse.json(
        { 
          success: false, 
          message: "Validation error", 
          errors 
        },
        { status: 400 }
      );
    }

    const { email, aydoHandle, password, discordName, rsiAccountName } = result.data;

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: "Email already in use" },
        { status: 409 }
      );
    }

    // Check if AYDO handle already exists
    const existingHandle = await prisma.user.findUnique({
      where: { aydoHandle },
    });

    if (existingHandle) {
      return NextResponse.json(
        { success: false, message: "AYDO handle already in use" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        aydoHandle,
        passwordHash,
        discordName,
        rsiAccountName,
        profile: {
          create: {} // Create empty profile
        }
      },
    });

    // Return success response with user data (excluding password)
    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        aydoHandle: user.aydoHandle,
      },
    });
  } catch (error) {
    console.error("Error in signup route:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during signup" },
      { status: 500 }
    );
  }
} 
