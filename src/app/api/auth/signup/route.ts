import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// In a real application, this would be imported from a database module
// For now, we'll use the same in-memory store as in auth.ts
const users = [
  {
    id: '1',
    aydoHandle: 'admin',
    email: 'admin@aydocorp.com',
    password: '$2b$10$8OxDFt.GT.LV4xmX9ATR8.w4kGhJZgXnqnZqf5wn3EHQ8GqOAFMaK', // "password123"
    clearanceLevel: 5,
    role: 'admin',
    discordName: 'admin#1234',
    rsiAccountName: 'admin_rsi'
  },
  {
    id: '2',
    aydoHandle: 'user',
    email: 'user@aydocorp.com',
    password: '$2b$10$8OxDFt.GT.LV4xmX9ATR8.w4kGhJZgXnqnZqf5wn3EHQ8GqOAFMaK', // "password123"
    clearanceLevel: 1,
    role: 'user',
    discordName: 'user#5678',
    rsiAccountName: 'user_rsi'
  }
];

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
    
    // Check if user already exists
    const existingUser = users.find(
      u => u.aydoHandle === aydoHandle || u.email === email
    );
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this handle or email already exists' },
        { status: 409 }
      );
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create a new user
    // In a real application, this would be a database insert
    const newUser = {
      id: (users.length + 1).toString(),
      aydoHandle,
      email,
      password: hashedPassword,
      clearanceLevel: 1, // Default clearance level for new users
      role: 'user', // Default role for new users
      discordName: discordName || '',
      rsiAccountName: rsiAccountName || ''
    };
    
    // Add the user to our in-memory store
    // In a real application, this would be a database insert
    users.push(newUser);
    
    // Return success response
    return NextResponse.json(
      { 
        success: true,
        message: 'User created successfully',
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
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}