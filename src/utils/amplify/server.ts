import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../../amplify/data/resource";

// Initialize Amplify for server-side operations
const configureAmplify = () => {
  try {
    Amplify.configure({
      // Auth configuration will be automatically loaded from aws-exports.js
      // or you can specify it manually here
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
