import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactEmail } from '@/lib/email-service';

// Define validation schema for contact form
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message is too long'),
});

export async function POST(request: NextRequest) {
  try {
    console.log('Contact form API called');
    const body = await request.json();

    // Validate the request body
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      const errorMessage = result.error.errors[0].message;
      console.error('Validation error:', errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = result.data;

    // Send contact email
    const emailSent = await sendContactEmail(name, email, subject, message);

    if (!emailSent) {
      console.error('Failed to send contact email');
      return NextResponse.json(
        { error: 'Failed to send message. Please try again later.' },
        { status: 500 }
      );
    }

    console.log('Contact email sent successfully');
    return NextResponse.json(
      { message: 'Message transmitted successfully!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in contact API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
