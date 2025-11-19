import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendContactFormEmail } from '@/lib/email-service';
import { logInfo, logError } from '@/lib/logger';

// Validation schema
const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200, 'Subject too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message too long'),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const result = contactFormSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: result.error.errors.map(err => ({
            field: err.path[0],
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = result.data;

    // Check if email service is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      logError('Contact form submission failed - email not configured', undefined, {
        name,
        email: email.replace(/(?<=.{2}).(?=.*@)/g, '*'), // Mask email for privacy
      });

      return NextResponse.json(
        { error: 'Email service not configured. Please contact support directly.' },
        { status: 503 }
      );
    }

    // Send email
    const emailSent = await sendContactFormEmail(name, email, subject, message);

    if (!emailSent) {
      logError('Contact form email failed to send', undefined, { name, email });
      return NextResponse.json(
        { error: 'Failed to send message. Please try again later.' },
        { status: 500 }
      );
    }

    // Log success
    const duration = Date.now() - startTime;
    logInfo('Contact form submission successful', {
      name,
      email: email.replace(/(?<=.{2}).(?=.*@)/g, '*'),
      subject,
      duration,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Message transmitted successfully. We will respond within 24-48 hours.'
      },
      { status: 200 }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    logError('Contact form API error', error as Error, { duration });

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
