import { auth0 } from '../../../../lib/auth0';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const response = await auth0.middleware(req);
    
    if (!response) {
      console.error('Auth0: No response from middleware');
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return response;
  } catch (error) {
    console.error('Auth0 error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('invalid_request')) {
        return new Response(JSON.stringify({ error: 'Invalid authentication request' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      if (error.message.includes('unauthorized')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    }

    // Generic error response
    return new Response(JSON.stringify({ error: 'Authentication error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 