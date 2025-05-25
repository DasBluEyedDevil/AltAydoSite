import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Get file buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Store image in MongoDB (using GridFS)
    const bucket = new ObjectId();
    const filename = `${Date.now()}-${image.name}`;
    
    await db.collection('images.files').insertOne({
      _id: bucket,
      filename,
      contentType: image.type,
      uploadDate: new Date(),
      length: buffer.length,
      data: buffer
    });

    // Return the URL that can be used to retrieve the image
    const imageUrl = `/api/fleet-ops/operations/images/${bucket.toHexString()}`;

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
} 