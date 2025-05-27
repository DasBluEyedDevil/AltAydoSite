import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth';
import { MissionResponse, MissionStatus, MissionType } from '@/types/Mission';
import * as missionStorage from '@/lib/mission-storage';

// Validation schema for mission participant
const validateMissionParticipant = (participant: any) => {
  if (!participant.userId) return false;
  if (!participant.userName) return false;
  return true;
};

// Validation for mission data
const validateMissionData = (data: any) => {
  if (!data.name || typeof data.name !== 'string' || data.name.length < 3) {
    return { valid: false, error: 'Name must be at least 3 characters' };
  }

  if (!data.type || !Object.values(MissionType).includes(data.type as MissionType)) {
    return { valid: false, error: 'Invalid mission type' };
  }

  if (!data.scheduledDateTime) {
    return { valid: false, error: 'Scheduled date and time is required' };
  }

  if (!data.status || !Object.values(MissionStatus).includes(data.status as MissionStatus)) {
    return { valid: false, error: 'Invalid mission status' };
  }

  // Validate participants if provided
  if (data.participants && Array.isArray(data.participants)) {
    for (const participant of data.participants) {
      if (!validateMissionParticipant(participant)) {
        return { valid: false, error: 'Invalid participant data' };
      }
    }
  }

  return { valid: true };
};

// GET handler - List missions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filters: { status?: string; leaderId?: string; userId?: string } = {};

    const status = searchParams.get('status');
    if (status) filters.status = status;

    const leaderId = searchParams.get('leaderId');
    if (leaderId) filters.leaderId = leaderId;

    console.log('Fetching missions with filters:', filters);

    // Get missions using the mission-storage module
    const missions = await missionStorage.getAllMissions(filters);

    console.log(`Returning ${missions.length} missions`);

    return NextResponse.json(missions);

  } catch (error: any) {
    console.error('Error fetching missions:', error);
    return NextResponse.json(
      { error: `Failed to fetch missions: ${error.message}` },
      { status: 500 }
    );
  }
}

// POST handler - Create a new mission
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate mission data
    const validation = validateMissionData(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Prepare mission data
    const missionData = {
      name: body.name,
      type: body.type,
      scheduledDateTime: body.scheduledDateTime,
      status: body.status,
      briefSummary: body.briefSummary || '',
      details: body.details || '',
      location: body.location || '',
      leaderId: body.leaderId || userId,
      leaderName: body.leaderName || '',
      images: body.images || [],
      participants: body.participants || []
    };

    console.log('Creating mission:', missionData.name);

    // Create mission using the mission-storage module
    const mission = await missionStorage.createMission(missionData);

    console.log('Mission created successfully:', mission.id);

    return NextResponse.json(mission, { status: 201 });

  } catch (error: any) {
    console.error('Error creating mission:', error);

    // Prepare a user-friendly error message
    let errorMessage = 'Failed to create mission';
    let errorDetails = null;

    if (error.message) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }

    // Check if we're using fallback storage
    if (missionStorage.isUsingFallbackStorage()) {
      console.log('Using fallback storage due to MongoDB connection issues');
      errorDetails = {
        usingFallback: true,
        message: 'Using local storage due to database connection issues'
      };
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}

// PUT handler - Update an existing mission
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    if (!body.id) {
      return NextResponse.json({ error: 'Mission ID is required' }, { status: 400 });
    }

    // Validate mission data
    const validation = validateMissionData(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Prepare mission data for update
    const missionData = {
      name: body.name,
      type: body.type,
      scheduledDateTime: body.scheduledDateTime,
      status: body.status,
      briefSummary: body.briefSummary || '',
      details: body.details || '',
      location: body.location || '',
      leaderId: body.leaderId,
      leaderName: body.leaderName || '',
      images: body.images || [],
      participants: body.participants || []
    };

    console.log('Updating mission:', body.id);

    // Update mission using the mission-storage module
    const updatedMission = await missionStorage.updateMission(body.id, missionData);

    if (!updatedMission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    console.log('Mission updated successfully:', updatedMission.id);

    return NextResponse.json(updatedMission);

  } catch (error: any) {
    console.error('Error updating mission:', error);

    // Prepare a user-friendly error message
    let errorMessage = 'Failed to update mission';
    let errorDetails = null;

    if (error.message) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }

    // Check if we're using fallback storage
    if (missionStorage.isUsingFallbackStorage()) {
      console.log('Using fallback storage due to MongoDB connection issues');
      errorDetails = {
        usingFallback: true,
        message: 'Using local storage due to database connection issues'
      };
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}

// DELETE handler - Delete a mission
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse mission ID from URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Mission ID is required' }, { status: 400 });
    }

    console.log('Deleting mission:', id);

    // Delete mission using the mission-storage module
    const success = await missionStorage.deleteMission(id);

    if (!success) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    console.log('Mission deleted successfully:', id);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error deleting mission:', error);

    // Prepare a user-friendly error message
    let errorMessage = 'Failed to delete mission';
    let errorDetails = null;

    if (error.message) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }

    // Check if we're using fallback storage
    if (missionStorage.isUsingFallbackStorage()) {
      console.log('Using fallback storage due to MongoDB connection issues');
      errorDetails = {
        usingFallback: true,
        message: 'Using local storage due to database connection issues'
      };
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}
