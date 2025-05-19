import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import crypto from 'crypto';
import { User } from '@/types/user';
import * as userStorage from '@/lib/user-storage';

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
    console.log('Signup API called');
    const body = await request.json();
    console.log('Signup request body received', { ...body, password: '[REDACTED]', confirmPassword: '[REDACTED]' });

    // Validate the request body
    const result = signupSchema.safeParse(body);
    if (!result.success) {
      const errorMessage = result.error.errors[0].message;
      console.error('Validation error:', errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    const { aydoHandle, email, password, discordName, rsiAccountName } = result.data;

    try {
      // Check if user already exists by handle
      console.log(`Checking if handle exists: ${aydoHandle}`);
      const existingUserByHandle = await userStorage.getUserByHandle(aydoHandle);
      if (existingUserByHandle) {
        console.log(`User with handle ${aydoHandle} already exists`);
        return NextResponse.json(
          { error: 'User with this handle already exists' },
          { status: 409 }
        );
      }

      // Check if user already exists by email
      console.log(`Checking if email exists: ${email}`);
      const existingUserByEmail = await userStorage.getUserByEmail(email);
      if (existingUserByEmail) {
        console.log(`User with email ${email} already exists`);
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }
    } catch (checkError) {
      console.error('Error checking for existing user:', checkError);
      return NextResponse.json(
        { error: 'Error checking user existence. Please try again later.' },
        { status: 500 }
      );
    }

    // Hash the password
    console.log('Hashing password');
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (hashError) {
      console.error('Error hashing password:', hashError);
      return NextResponse.json(
        { error: 'Error processing password. Please try again.' },
        { status: 500 }
      );
    }

    // Create a unique ID for the user
    const userId = crypto.randomUUID();
    console.log(`Created user ID: ${userId}`);

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

    try {
      // Save the user using our hybrid storage approach
      console.log('Saving user to storage...');
      await userStorage.createUser(newUser);
      console.log('User created successfully');
      console.log(`Using fallback storage: ${userStorage.isUsingFallbackStorage() ? 'Yes' : 'No'}`);

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
    } catch (createError: any) {
      console.error('Error creating user in database:', createError);
      return NextResponse.json(
        { error: `Database error: ${createError.message || 'Failed to save user data'}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error during user registration:', error);
    return NextResponse.json(
      { error: `Registration failed: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
