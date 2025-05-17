import { NextRequest, NextResponse } from "next/server";
import { Amplify } from "aws-amplify";
import { getToken } from "next-auth/jwt";

// Initialize Amplify with your configuration
// This should match the configuration in your Amplify setup
const configureAmplify = () => {
  try {
    // Only configure Amplify for data access, not for auth
    const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
    const apiKey = process.env.NEXT_PUBLIC_GRAPHQL_API_KEY;
    const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';

    if (!endpoint || !apiKey) {
      console.warn("Middleware: Missing GraphQL endpoint or API key. Amplify will not be fully functional.");
      console.warn("Please set NEXT_PUBLIC_GRAPHQL_ENDPOINT and NEXT_PUBLIC_GRAPHQL_API_KEY in your environment.");
    }

    Amplify.configure({
      API: {
        GraphQL: {
          endpoint: endpoint || '',
          apiKey: apiKey || '',
          region: region,
          defaultAuthMode: 'apiKey'
        }
      }
    });
  } catch (error) {
    console.error("Error configuring Amplify:", error);
  }
};

export const createClient = (request: NextRequest) => {
  // Create an unmodified response
  const amplifyResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Configure Amplify for SSR
  configureAmplify();

  // Return the Amplify client and response
  return { amplifyResponse };
};

// Helper function to check if a user is authenticated using NextAuth
export const isAuthenticated = async (request?: NextRequest) => {
  try {
    if (!request) {
      console.warn("No request object provided to isAuthenticated");
      return false;
    }

    // Use NextAuth's getToken to check if the user is authenticated
    const token = await getToken({ 
      req: request as any, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // If we have a token, the user is authenticated
    return !!token;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};
