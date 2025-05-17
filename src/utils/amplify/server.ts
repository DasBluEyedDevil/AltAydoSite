import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../amplify/data/resource";

// Initialize Amplify for server-side operations
const configureAmplify = () => {
  try {
    // Only configure Amplify for data access, not for auth
    // We're using NextAuth.js for authentication
    const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
    const apiKey = process.env.NEXT_PUBLIC_GRAPHQL_API_KEY;
    const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';

    if (!endpoint || !apiKey) {
      console.warn("Server: Missing GraphQL endpoint or API key. Amplify will not be fully functional.");
      console.warn("Please set NEXT_PUBLIC_GRAPHQL_ENDPOINT and NEXT_PUBLIC_GRAPHQL_API_KEY in your environment.");
    }

    Amplify.configure({
      API: {
        GraphQL: {
          endpoint: endpoint || '',
          apiKey: apiKey || '',
          region: region,
        }
      }
    });
  } catch (error) {
    console.error("Error configuring Amplify:", error);
  }
};

// Configure Amplify
configureAmplify();

// Create a data client for server-side operations
export const createServerClient = () => {
  try {
    // Generate a client for the Amplify data schema
    const client = generateClient<Schema>();
    return { client };
  } catch (error) {
    console.error("Error creating Amplify client:", error);
    // Return a dummy client for error cases
    return { 
      client: {
        models: {}
      } 
    };
  }
};
