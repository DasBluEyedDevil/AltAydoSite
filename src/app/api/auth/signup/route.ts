import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import crypto from 'crypto';
import { User } from '@/types/user';
import { getUserByHandle, getUserByEmail, createUser } from '@/lib/azure-cosmos';

// Define validation schema for signup data
const signupSchema = z.object({
  aydoHandle: z.string().min(3, 'Handle must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  discordName: z.string().optional(),
  rsiAccountName: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const result = signupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { aydoHandle, email, password, discordName, rsiAccountName } = result.data;

    // Check if user already exists in Cosmos DB by handle
    const existingUserByHandle = await getUserByHandle(aydoHandle);
    if (existingUserByHandle) {
      return NextResponse.json(
        { error: 'User with this handle already exists' },
        { status: 409 }
      );
    }

    // Check if user already exists in Cosmos DB by email
    const existingUserByEmail = await getUserByEmail(email);
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a unique ID for the user
    const userId = crypto.randomUUID();

    // Create a new user
    const newUser: User = {
      id: userId,
      aydoHandle,
      email,
      passwordHash: hashedPassword,
      clearanceLevel: 1,
      role: 'user',
      discordName: discordName || null,
      rsiAccountName: rsiAccountName || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save the user to Cosmos DB
    await createUser(newUser);

    // Return success
    return NextResponse.json(
      { 
        message: 'User registered successfully', 
        user: {
          id: newUser.id,
          aydoHandle: newUser.aydoHandle,
          email: newUser.email,
          clearanceLevel: newUser.clearanceLevel,
          role: newUser.role
        } 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error during user registration:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
