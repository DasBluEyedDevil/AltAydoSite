import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

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

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Check if email already exists
    const { data: existingEmail, error: emailError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (emailError && emailError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error("Email check error:", emailError);
      return NextResponse.json(
        { success: false, message: "Error checking email availability" },
        { status: 500 }
      );
    }

    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: "Email already in use" },
        { status: 409 }
      );
    }

    // Check if AYDO handle already exists
    const { data: existingHandle, error: handleError } = await supabase
      .from('users')
      .select('id')
      .eq('aydoHandle', aydoHandle)
      .single();

    if (handleError && handleError.code !== 'PGRST116') {
      console.error("Handle check error:", handleError);
      return NextResponse.json(
        { success: false, message: "Error checking handle availability" },
        { status: 500 }
      );
    }

    if (existingHandle) {
      return NextResponse.json(
        { success: false, message: "AYDO handle already in use" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error: createError } = await supabase
      .from('users')
      .insert([
        {
          email,
          aydoHandle,
          passwordHash,
          discordName,
          rsiAccountName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          clearanceLevel: 1,
          role: 'member'
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error("User creation error:", createError);
      return NextResponse.json(
        { success: false, message: "Error creating user" },
        { status: 500 }
      );
    }

    // Create empty profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          userId: user.id
        }
      ]);

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Continue anyway as the user was created successfully
    }

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
