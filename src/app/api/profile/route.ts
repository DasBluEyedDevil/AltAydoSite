import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { authOptions } from '../auth/auth';
import * as userStorage from '@/lib/user-storage';
import { UserShip } from '@/types/user';

// Define the UserShip schema
const userShipSchema = z.object({
  manufacturer: z.string(),
  name: z.string(),
  image: z.string()
});

// Profile update validation schema
const profileUpdateSchema = z.object({
  discordName: z.string().optional().nullable(),
  rsiAccountName: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  photo: z.string().optional().nullable(),
  payGrade: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  division: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),
  ships: z.array(userShipSchema).optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log('GET Profile - Unauthorized attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the user from storage
    const userId = session.user.id;
    console.log(`GET Profile - Retrieving user data for ID: ${userId}`);
    
    const user = await userStorage.getUserById(userId);
    
    if (!user) {
      console.log(`GET Profile - User not found for ID: ${userId}`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log(`GET Profile - Ships data for user ${userId}:`, {
      hasShips: !!user.ships,
      shipsCount: user.ships?.length || 0
    });
    
    if (user.ships && user.ships.length > 0) {
      console.log('GET Profile - Sample ship data:', user.ships[0]);
    }
    
    // Return the profile data (excluding sensitive info)
    const response = {
      id: user.id,
      aydoHandle: user.aydoHandle,
      email: user.email,
      discordName: user.discordName,
      rsiAccountName: user.rsiAccountName,
      bio: user.bio || null,
      photo: user.photo || null,
      payGrade: user.payGrade || null,
      position: user.position || null,
      division: user.division || null,
      timezone: user.timezone || null,
      ships: user.ships || [],
    };
    
    console.log(`GET Profile - Response ships count: ${response.ships.length}`);
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: `Failed to fetch profile: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log('PUT Profile - Unauthorized attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    let body;
    
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('PUT Profile - Invalid JSON in request body:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    console.log(`PUT Profile - Received update for user ${userId} with fields:`, Object.keys(body));
    
    if (body.ships) {
      console.log(`PUT Profile - Ships data received:`, {
        count: body.ships.length,
        isArray: Array.isArray(body.ships),
        sample: body.ships.length > 0 ? body.ships[0] : null
      });
    }
    
    // Handle ships-only updates specially
    const isShipsOnlyUpdate = Object.keys(body).length === 1 && body.ships !== undefined;
    if (isShipsOnlyUpdate) {
      console.log(`PUT Profile - Ships-only update detected for user ${userId}`);
      
      if (!Array.isArray(body.ships)) {
        console.error('PUT Profile - Ships data is not an array:', body.ships);
        return NextResponse.json(
          { error: 'Ships data must be an array' }, 
          { status: 400 }
        );
      }
      
      // Validate each ship in the array
      for (let i = 0; i < body.ships.length; i++) {
        const ship = body.ships[i];
        if (!ship.manufacturer || !ship.name || !ship.image) {
          console.error(`PUT Profile - Invalid ship at index ${i}:`, ship);
          return NextResponse.json(
            { error: `Ship at index ${i} is missing required fields` }, 
            { status: 400 }
          );
        }
      }
      
      // Get existing user first
      const existingUser = await userStorage.getUserById(userId);
      if (!existingUser) {
        console.log(`PUT Profile - User not found for ID: ${userId}`);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      console.log(`PUT Profile - Existing user found, current ships count: ${existingUser.ships?.length || 0}`);
      
      // Only update ships field
      const updatedUser = await userStorage.updateUser(userId, {
        ships: body.ships
      });
      
      if (!updatedUser) {
        console.error(`PUT Profile - Failed to update ships for user ${userId}`);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
      }
      
      console.log(`PUT Profile - Ships-only update successful for user ${userId}. Updated ships count:`, updatedUser.ships?.length || 0);
      
      // Return the updated profile data
      const response = {
        id: updatedUser.id,
        aydoHandle: updatedUser.aydoHandle,
        email: updatedUser.email,
        discordName: updatedUser.discordName,
        rsiAccountName: updatedUser.rsiAccountName,
        bio: updatedUser.bio || null,
        photo: updatedUser.photo || null,
        payGrade: updatedUser.payGrade || null,
        position: updatedUser.position || null,
        division: updatedUser.division || null,
        timezone: updatedUser.timezone || null,
        ships: updatedUser.ships || [],
      };
      
      return NextResponse.json(response);
    }
    
    // Validate request body (for non-ships-only updates)
    const result = profileUpdateSchema.safeParse(body);
    if (!result.success) {
      const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      console.error(`PUT Profile - Validation error for user ${userId}:`, errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    
    // Get validated data
    const updates = result.data;
    
    if (updates.ships) {
      console.log(`PUT Profile - Validated ships data for user ${userId}:`, {
        count: updates.ships.length,
        sample: updates.ships.length > 0 ? updates.ships[0] : null
      });
    }
    
    // Update the user profile
    const updatedUser = await userStorage.updateUser(userId, updates);
    
    if (!updatedUser) {
      console.error(`PUT Profile - Failed to update profile for user ${userId}`);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
    
    console.log(`PUT Profile - Successfully updated user ${userId}. Ships count:`, updatedUser.ships?.length || 0);
    
    // Return the updated profile data
    const response = {
      id: updatedUser.id,
      aydoHandle: updatedUser.aydoHandle,
      email: updatedUser.email,
      discordName: updatedUser.discordName,
      rsiAccountName: updatedUser.rsiAccountName,
      bio: updatedUser.bio || null,
      photo: updatedUser.photo || null,
      payGrade: updatedUser.payGrade || null,
      position: updatedUser.position || null,
      division: updatedUser.division || null,
      timezone: updatedUser.timezone || null,
      ships: updatedUser.ships || [],
    };
    
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: `Failed to update profile: ${error.message}` },
      { status: 500 }
    );
  }
} 