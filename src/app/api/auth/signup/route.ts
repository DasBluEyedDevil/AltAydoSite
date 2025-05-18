import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User } from '@/types/user';

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

// Local storage for users
const dataDir = path.join(process.cwd(), 'data');
const usersFilePath = path.join(dataDir, 'users.json');

// Helper function to read users from local storage
const getLocalUsers = (): User[] => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([]), 'utf8');
    return [];
  }
  
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data) as User[];
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
};

// Helper function to save users to local storage
const saveLocalUser = (user: User): void => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const users = getLocalUsers();
  
  // Check if user already exists with same id
  const existingUserIndex = users.findIndex(u => u.id === user.id);
  if (existingUserIndex >= 0) {
    // Update existing user
    users[existingUserIndex] = user;
  } else {
    // Add new user
    users.push(user);
  }
  
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
};

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

    // Check if user already exists in local storage
    const localUsers = getLocalUsers();
    const existingLocalUser = localUsers.find(u => 
      u.aydoHandle.toLowerCase() === aydoHandle.toLowerCase() || 
      u.email.toLowerCase() === email.toLowerCase()
    );

    if (existingLocalUser) {
      return NextResponse.json(
        { error: 'User with this handle or email already exists' },
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

    // Save the user to local storage
    saveLocalUser(newUser);

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
