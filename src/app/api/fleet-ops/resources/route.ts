import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth';
import * as resourceStorage from '@/lib/resource-storage';
import * as userStorage from '@/lib/user-storage';
import { Resource, ResourceType, ResourceStatus } from '@/types/Resource';
import { z } from 'zod';

// Validation schema for creating a resource
const resourceSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  type: z.enum(['Vehicle', 'Ship', 'Equipment', 'Consumable', 'Personnel']),
  status: z.enum(['Available', 'Reserved', 'Deployed', 'Maintenance', 'Unavailable']),
  description: z.string(),
  location: z.string(),
  owner: z.string(),
  assignedTo: z.string().optional(),
  quantity: z.number().int().positive().optional(),
  capacity: z.number().int().positive().optional(),
  specs: z.record(z.string()).optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  imageUrl: z.string().optional()
});

// Helper to check if user has leadership role
async function hasLeadershipRole(_userId: string): Promise<boolean> {
  // Remove role restrictions
  return true;

  // Commented out original implementation for future reference
  /*
  const user = await userStorage.getUserById(userId);
  if (!user) return false;
  
  // Check for leadership roles or clearance level
  const leadershipRoles = ['Director', 'Manager', 'Board Member'];
  return leadershipRoles.includes(user.role) || user.clearanceLevel >= 3;
  */
}

// GET /api/fleet-ops/resources - Get all resources or filter by type, status, owner
export async function GET(req: NextRequest) {
  try {
    // Get the session to check if the user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse query parameters for filtering
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type') as ResourceType | null;
    const status = searchParams.get('status') as ResourceStatus | null;
    const ownerId = searchParams.get('owner');
    
    // Get all resources
    let resources = await resourceStorage.getAllResources();
    
    // Apply filters if provided
    if (type) {
      resources = resources.filter(resource => resource.type === type);
    }
    
    if (status) {
      resources = resources.filter(resource => resource.status === status);
    }
    
    if (ownerId) {
      resources = resources.filter(resource => resource.owner === ownerId);
    }
    
    // Enhance resources with owner names
    const resourcesWithOwnerNames = await Promise.all(resources.map(async (resource) => {
      const owner = await userStorage.getUserById(resource.owner);
      const ownerName = owner ? owner.aydoHandle : 'Unknown';
      
      // If assigned to someone, get their name
      let assignedToName;
      if (resource.assignedTo) {
        const assignedUser = await userStorage.getUserById(resource.assignedTo);
        assignedToName = assignedUser ? assignedUser.aydoHandle : 'Unknown';
      }
      
      return {
        ...resource,
        ownerName,
        assignedToName
      };
    }));
    
    // Basic pagination at API layer
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSizeRaw = parseInt(searchParams.get('pageSize') || '50', 10);
    const pageSize = Math.min(200, Math.max(1, pageSizeRaw));
    const start = (page - 1) * pageSize;
    const paged = resourcesWithOwnerNames.slice(start, start + pageSize);

    const res = NextResponse.json({
      items: paged,
      page,
      pageSize,
      total: resourcesWithOwnerNames.length,
      totalPages: Math.ceil(resourcesWithOwnerNames.length / pageSize) || 1,
    });
    res.headers.set('Cache-Control', 'no-store');
    return res;
  } catch (error: any) {
    console.error('Error getting resources:', error);
    return NextResponse.json(
      { error: `Failed to get resources: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// POST /api/fleet-ops/resources - Create a new resource
export async function POST(req: NextRequest) {
  try {
    // Get the session to check if the user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only leadership can create resources
    const userHasLeadershipRole = await hasLeadershipRole(session.user.id);
    if (!userHasLeadershipRole) {
      return NextResponse.json({ error: 'Insufficient privileges' }, { status: 403 });
    }
    
    // Parse and validate request body
    const requestData = await req.json();
    
    try {
      const validatedData = resourceSchema.parse(requestData);
      
      // Create the resource
      const resource = await resourceStorage.createResource(validatedData);
      
      return NextResponse.json(resource, { status: 201 });
    } catch (validationError: any) {
      return NextResponse.json(
        { error: `Validation error: ${validationError.errors?.[0]?.message || validationError.message}` },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { error: `Failed to create resource: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// GET /api/fleet-ops/resources/:id - Get a specific resource

// PUT /api/fleet-ops/resources/:id - Update a resource
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Get the session to check if the user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const resourceId = id;
    
    // Get the existing resource
    const existingResource = await resourceStorage.getResourceById(resourceId);
    if (!existingResource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
    
    // Check if the user has permission to update this resource
    const userHasLeadershipRole = await hasLeadershipRole(session.user.id);
    const isOwner = existingResource.owner === session.user.id;
    
    if (!userHasLeadershipRole && !isOwner) {
      return NextResponse.json({ error: 'Insufficient privileges' }, { status: 403 });
    }
    
    // Parse and validate request body
    const requestData = await req.json();
    
    try {
      // Partial validation for update - only validate fields that are provided
      const validatedData: Partial<Resource> = {};
      
      if (requestData.name !== undefined) {
        validatedData.name = z.string().min(3).parse(requestData.name);
      }
      
      if (requestData.type !== undefined) {
        validatedData.type = z.enum(['Vehicle', 'Ship', 'Equipment', 'Consumable', 'Personnel']).parse(requestData.type);
      }
      
      if (requestData.status !== undefined) {
        validatedData.status = z.enum(['Available', 'Reserved', 'Deployed', 'Maintenance', 'Unavailable']).parse(requestData.status);
      }
      
      if (requestData.description !== undefined) {
        validatedData.description = z.string().parse(requestData.description);
      }
      
      if (requestData.location !== undefined) {
        validatedData.location = z.string().parse(requestData.location);
      }
      
      if (requestData.assignedTo !== undefined) {
        validatedData.assignedTo = z.string().optional().parse(requestData.assignedTo);
      }
      
      if (requestData.quantity !== undefined) {
        validatedData.quantity = z.number().int().positive().optional().parse(requestData.quantity);
      }
      
      if (requestData.capacity !== undefined) {
        validatedData.capacity = z.number().int().positive().optional().parse(requestData.capacity);
      }
      
      if (requestData.specs !== undefined) {
        validatedData.specs = z.record(z.string()).optional().parse(requestData.specs);
      }
      
      if (requestData.manufacturer !== undefined) {
        validatedData.manufacturer = z.string().optional().parse(requestData.manufacturer);
      }
      
      if (requestData.model !== undefined) {
        validatedData.model = z.string().optional().parse(requestData.model);
      }
      
      if (requestData.imageUrl !== undefined) {
        validatedData.imageUrl = z.string().optional().parse(requestData.imageUrl);
      }
      
      // Only leadership can change ownership
      if (requestData.owner !== undefined) {
        if (!userHasLeadershipRole) {
          return NextResponse.json({ error: 'Only leadership can change resource ownership' }, { status: 403 });
        }
        validatedData.owner = z.string().parse(requestData.owner);
      }
      
      // Update the resource
      const updatedResource = await resourceStorage.updateResource(resourceId, validatedData);
      
      if (!updatedResource) {
        return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
      }
      
      return NextResponse.json(updatedResource);
    } catch (validationError: any) {
      return NextResponse.json(
        { error: `Validation error: ${validationError.errors?.[0]?.message || validationError.message}` },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error(`Error updating resource: ${error}`);
    return NextResponse.json(
      { error: `Failed to update resource: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// DELETE /api/fleet-ops/resources/:id - Delete a resource
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Get the session to check if the user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const resourceId = id;
    
    // Get the existing resource
    const existingResource = await resourceStorage.getResourceById(resourceId);
    if (!existingResource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }
    
    // Check if the user has permission to delete this resource
    const userHasLeadershipRole = await hasLeadershipRole(session.user.id);
    const isOwner = existingResource.owner === session.user.id;
    
    if (!userHasLeadershipRole && !isOwner) {
      return NextResponse.json({ error: 'Insufficient privileges' }, { status: 403 });
    }
    
    // Delete the resource
    await resourceStorage.deleteResource(resourceId);
    
    return NextResponse.json({ message: 'Resource deleted successfully' });
  } catch (error: any) {
    console.error(`Error deleting resource: ${error}`);
    return NextResponse.json(
      { error: `Failed to delete resource: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
} 