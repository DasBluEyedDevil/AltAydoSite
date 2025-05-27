import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;
    const missionId = formData.get('missionId') as string;

    if (!image || !missionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate file
    if (image.size > 5000000) { // 5MB limit
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    if (!image.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Get file buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Connect to MongoDB
    const { db } = await connectToDatabase();

    // Store image in MongoDB
    const imageDoc = {
      missionId: new ObjectId(missionId),
      filename: image.name,
      contentType: image.type,
      size: image.size,
      uploadedBy: session.user.id,
      uploadedAt: new Date(),
      data: buffer
    };

    const result = await db.collection('missionImages').insertOne(imageDoc);

    if (!result.insertedId) {
      throw new Error('Failed to insert image');
    }

    // Update mission with image reference
    await db.collection('missions').updateOne(
      { _id: new ObjectId(missionId) },
      { 
        $push: { 
          images: {
            _id: result.insertedId,
            filename: image.name,
            uploadedBy: session.user.id,
            uploadedAt: new Date()
          }
        } 
      }
    );

    return NextResponse.json({ 
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageId: result.insertedId.toString(),
        filename: image.name,
        contentType: image.type,
        size: image.size
      }
    });

  } catch (error) {
    console.error('Error in upload-image route:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
