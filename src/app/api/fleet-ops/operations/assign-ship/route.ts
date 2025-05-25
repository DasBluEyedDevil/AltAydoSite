import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, shipId, shipName, shipType, missionId } = await request.json();

    if (!userId || !missionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();

    // Update the mission participant's ship assignment
    const result = await db.collection('missions').updateOne(
      { 
        _id: missionId,
        'participants.userId': userId 
      },
      {
        $set: {
          'participants.$.shipId': shipId,
          'participants.$.shipName': shipName,
          'participants.$.shipType': shipType,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Mission or participant not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error assigning ship:', error);
    return NextResponse.json({ error: 'Failed to assign ship' }, { status: 500 });
  }
} 