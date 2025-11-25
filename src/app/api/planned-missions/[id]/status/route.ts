import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/auth';
import {
  getPlannedMissionById,
  updatePlannedMissionStatus,
  canUserModifyMission
} from '@/lib/planned-mission-storage';
import { PlannedMissionStatus } from '@/types/PlannedMission';

const VALID_STATUSES: PlannedMissionStatus[] = [
  'DRAFT',
  'SCHEDULED',
  'ACTIVE',
  'DEBRIEFING',
  'COMPLETED',
  'CANCELLED'
];

// Valid status transitions
const STATUS_TRANSITIONS: Record<PlannedMissionStatus, PlannedMissionStatus[]> = {
  DRAFT: ['SCHEDULED', 'CANCELLED'],
  SCHEDULED: ['ACTIVE', 'CANCELLED', 'DRAFT'],
  ACTIVE: ['DEBRIEFING', 'COMPLETED', 'CANCELLED'],
  DEBRIEFING: ['COMPLETED', 'ACTIVE'],
  COMPLETED: [], // Terminal state
  CANCELLED: ['DRAFT'] // Can restore to draft
};

// PATCH - Update mission status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const missionId = resolvedParams.id;
    const userId = (session.user as any).id;
    const userClearance = (session.user as any).clearanceLevel || 1;

    // Check if user can modify this mission
    const canModify = await canUserModifyMission(userId, missionId);
    if (!canModify && userClearance < 4) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this mission' },
        { status: 403 }
      );
    }

    const mission = await getPlannedMissionById(missionId);
    if (!mission) {
      return NextResponse.json(
        { error: 'Mission not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { status } = body as { status: PlannedMissionStatus };

    // Validate status
    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if transition is valid
    const allowedTransitions = STATUS_TRANSITIONS[mission.status];
    if (!allowedTransitions.includes(status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${mission.status} to ${status}. Allowed transitions: ${allowedTransitions.join(', ') || 'none'}` },
        { status: 400 }
      );
    }

    // Update the status
    const updatedMission = await updatePlannedMissionStatus(missionId, status);

    if (!updatedMission) {
      return NextResponse.json(
        { error: 'Failed to update status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      mission: updatedMission,
      previousStatus: mission.status,
      newStatus: status
    });
  } catch (error) {
    console.error('Error updating mission status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get current status and allowed transitions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const missionId = resolvedParams.id;

    const mission = await getPlannedMissionById(missionId);
    if (!mission) {
      return NextResponse.json(
        { error: 'Mission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      currentStatus: mission.status,
      allowedTransitions: STATUS_TRANSITIONS[mission.status]
    });
  } catch (error) {
    console.error('Error getting mission status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
