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
    console.log("Prisma client initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Prisma client:", error);
    // Fallback to prevent server crash
    globalForPrisma.prisma = {} as PrismaClient;
  }
}

prisma = globalForPrisma.prisma;

export async function POST(request: Request) {
  console.log("Signup request received");
  try {
    // First check if Prisma client is properly initialized
    if (!prisma.user) {
      console.error("Prisma client is not properly initialized for signup");
      return NextResponse.json(
        { error: 'Database client initialization failed' },
        { status: 500 }
      );
    }

    // Log database URL format (without credentials)
    try {
      const dbUrl = process.env.DATABASE_URL || '';
      const urlParts = dbUrl.split('@');
      if (urlParts.length > 1) {
        console.log(`Database connection using: ${urlParts[0].split(':')[0]}://*****@${urlParts[1]}`);
      } else {
        console.log("Database URL format could not be logged safely");
      }
    } catch (err) {
      console.error("Error logging database URL format:", err);
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log("Request body parsed successfully");
    } catch (error) {
      console.error("Error parsing request body:", error);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const { aydoHandle, email, discordName, rsiAccountName, password } = body;
    
    // Debug logging for email value
    console.log(`Signup attempt for handle: ${aydoHandle}, email: "${email}"`);
    console.log("Email type:", typeof email);
    console.log("Email length:", email?.length);
    console.log("Email validation regex test:", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || ""));

    // Validate required fields
    if (!aydoHandle || !email || !password) {
      console.log("Required fields missing", { aydoHandle: !!aydoHandle, email: !!email, password: !!password });
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(`Invalid email format: ${email}`);
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    console.log("Checking for existing users...");
    
    // Check if user already exists - with error handling
    console.log("Starting email existence check for:", email);
    let existingUserByEmail;
    try {
      // Log connection status
      console.log("About to perform email check with Prisma");
      
      existingUserByEmail = await prisma.user.findUnique({
        where: { email }
      });
      
      console.log("Email existence check completed successfully");
      console.log("User found with this email?", existingUserByEmail ? "Yes" : "No");
    } catch (error) {
      console.error("Error checking for existing email:", error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error("Error type:", error.constructor.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        
        // Check for Prisma-specific errors
        if ('code' in (error as any)) {
          console.error("Prisma error code:", (error as any).code);
        }
      }
      
      return NextResponse.json(
        { error: 'Database query failed when checking email' },
        { status: 500 }
      );
    }

    if (existingUserByEmail) {
      console.log(`Email already in use: ${email}`);
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    let existingUserByHandle;
    try {
      existingUserByHandle = await prisma.user.findUnique({
        where: { aydoHandle }
      });
      console.log("Handle existence check completed");
    } catch (error) {
      console.error("Error checking for existing handle:", error);
      return NextResponse.json(
        { error: 'Database query failed when checking handle' },
        { status: 500 }
      );
    }

    if (existingUserByHandle) {
      console.log(`Handle already in use: ${aydoHandle}`);
      return NextResponse.json(
        { error: 'AydoCorp Handle already in use' },
        { status: 400 }
      );
    }

    // Hash password
    console.log("Hashing password...");
    let passwordHash;
    try {
      const saltRounds = 10;
      passwordHash = await bcrypt.hash(password, saltRounds);
      console.log("Password hashed successfully");
    } catch (error) {
      console.error("Error hashing password:", error);
      return NextResponse.json(
        { error: 'Password encryption failed' },
        { status: 500 }
      );
    }

    // Create new user with clearance level 1 by default
    console.log("Creating new user in database...");
    let newUser;
    try {
      newUser = await prisma.user.create({
        data: {
          aydoHandle,
          email,
          discordName: discordName || null,
          rsiAccountName: rsiAccountName || null,
          passwordHash,
          clearanceLevel: 1,
          role: 'member' // Explicitly set role even though it has default in schema
        }
      });
      console.log(`User created successfully with ID: ${newUser.id}`);
    } catch (error) {
      console.error("Error creating user in database:", error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error("Error type:", error.constructor.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        
        // Check for Prisma-specific errors
        if ('code' in (error as any)) {
          console.error("Prisma error code:", (error as any).code);
        }
      }
      
      // Provide more specific error message if possible
      let errorMessage = 'Failed to create user';
      if (error instanceof Error) {
        // Log the full error for debugging
        console.error("Error details:", error.message);
        
        if (error.message.includes('Foreign key constraint')) {
          errorMessage = 'Foreign key constraint failed';
        } else if (error.message.includes('duplicate key')) {
          errorMessage = 'Duplicate entry detected';
        } else if (error.message.includes('constraint')) {
          errorMessage = 'Database constraint violation';
        }
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    // Return user without password
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    console.log("Signup successful, returning user data");
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Unexpected error during user creation:', error);
    
    // Return a more detailed error if available
    const errorMessage = error instanceof Error 
      ? `Failed to create user: ${error.message}`
      : 'Failed to create user: Unknown error';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 
