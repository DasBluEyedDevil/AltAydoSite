import { NextResponse } from 'next/server';
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

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    
    // Retrieve the image
    const image = await db.collection('images.files').findOne({
      _id: new ObjectId(id)
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Create response with appropriate headers
    return new NextResponse(image.data, {
      headers: {
        'Content-Type': image.contentType,
        'Content-Length': image.length.toString(),
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Error retrieving image:', error);
    return NextResponse.json({ error: 'Failed to retrieve image' }, { status: 500 });
  }
} 