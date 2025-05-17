import { NextRequest, NextResponse } from "next/server";
import { Amplify } from "aws-amplify";

// Initialize Amplify with your configuration
// This should match the configuration in your Amplify setup
const configureAmplify = () => {
  try {
    Amplify.configure({
      // Auth configuration will be automatically loaded from aws-exports.js
      // or you can specify it manually here
      ssr: true
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
  // This simplified version doesn't handle cookies like the Supabase version did
  // because Amplify handles auth tokens differently
  return { amplifyResponse };
};

// Helper function to check if a user is authenticated
// This will need to be implemented based on your Amplify auth setup
export const isAuthenticated = async () => {
  try {
    // In a real implementation, you would use Amplify Auth to check the session
    // For example: const user = await Auth.currentAuthenticatedUser();
    // For now, we'll return false to indicate not authenticated
    return false;
  } catch (error) {
    return false;
  }
};