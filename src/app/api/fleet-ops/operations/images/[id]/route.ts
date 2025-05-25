import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid image ID' }, { status: 400 });
    }

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Retrieve the image
    const image = await db.collection('missionImages').findOne({
      _id: new ObjectId(id)
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Create response with appropriate headers
    return new NextResponse(image.data, {
      headers: {
        'Content-Type': image.contentType,
        'Content-Length': image.size.toString(),
        'Cache-Control': 'public, max-age=31536000',
        'Content-Disposition': `inline; filename="${image.filename}"`
      }
    });

  } catch (error) {
    console.error('Error in get-image route:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 