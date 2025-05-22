import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth';
import * as operationStorage from '@/lib/operation-storage';
import * as userStorage from '@/lib/user-storage';
import { Operation, OperationStatus } from '@/types/Operation';
import { z } from 'zod';

// Validation schema for creating an operation
const operationParticipantSchema = z.object({
  userId: z.string(),
  shipName: z.string().optional(),
  shipManufacturer: z.string().optional(),
  role: z.string(),
  notes: z.string().optional()
});

const createOperationSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string(),
  status: z.enum(['Planning', 'Briefing', 'Active', 'Completed', 'Debriefing', 'Cancelled']),
  plannedDateTime: z.string(),
  location: z.string(),
  objectives: z.string(),
  participants: z.array(operationParticipantSchema).optional().default([]),
  diagramLinks: z.array(z.string()).optional().default([]),
  commsChannel: z.string().optional().default('')
});

// Helper to check if user has leadership role
async function hasLeadershipRole(userId: string): Promise<boolean> {
  const user = await userStorage.getUserById(userId);
  if (!user) return false;
  
  // Check for leadership roles
  const leadershipRoles = ['Director', 'Manager', 'Board Member'];
  return leadershipRoles.includes(user.role) || user.clearanceLevel >= 3;
}

// GET handler - List operations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const isLeadership = await hasLeadershipRole(userId);
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filters: { status?: string; leaderId?: string; userId?: string } = {};
    
    const status = searchParams.get('status');
    if (status) filters.status = status;
    
    const leaderId = searchParams.get('leaderId');
    if (leaderId) filters.leaderId = leaderId;
    
    // If not leadership, restrict to operations the user is part of
    if (!isLeadership) {
      filters.userId = userId;
    }
    
    // Get operations based on filters
    const operations = await operationStorage.getAllOperations(filters);
    
    // Map operations to include leader name
    const operationsWithDetails = await Promise.all(operations.map(async (op) => {
      const leader = await userStorage.getUserById(op.leaderId);
      return {
        ...op,
        leaderName: leader ? leader.aydoHandle : 'Unknown'
      };
    }));
    
    return NextResponse.json(operationsWithDetails);
    
  } catch (error: any) {
    console.error('Error fetching operations:', error);
    return NextResponse.json(
      { error: `Failed to fetch operations: ${error.message}` },
      { status: 500 }
    );
  }
}

// POST handler - Create a new operation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const isLeadership = await hasLeadershipRole(userId);
    
    // Check if user has permission to create operations
    if (!isLeadership) {
      return NextResponse.json(
        { error: 'Only leadership can create operations' },
        { status: 403 }
      );
    }
    
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const validationResult = createOperationSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors
        .map(e => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    
    // Create the operation
    const operationData = validationResult.data;
    const operation = await operationStorage.createOperation({
      ...operationData,
      leaderId: userId
    });
    
    // Get leader details for response
    const leader = await userStorage.getUserById(userId);
    
    return NextResponse.json({
      ...operation,
      leaderName: leader?.aydoHandle || 'Unknown'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating operation:', error);
    return NextResponse.json(
      { error: `Failed to create operation: ${error.message}` },
      { status: 500 }
    );
  }
} 