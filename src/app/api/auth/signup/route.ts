import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User } from '@/types/user';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';

// Define validation schema for signup data
const signupSchema = z.object({
  aydoHandle: z.string().min(3, 'Handle must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  discordName: z.string().optional(),
  rsiAccountName: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Set up Amplify client
let amplifyAvailable = false;
let amplifyClient: any = null;

try {
  // Configure Amplify for server-side
  Amplify.configure({
    // Configuration will be loaded from amplify_outputs.json or environment variables
    API: {
      GraphQL: {
        endpoint: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '',
        apiKey: process.env.NEXT_PUBLIC_GRAPHQL_API_KEY || '',
        region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
        defaultAuthMode: 'apiKey',
      },
    },
  });
  
  // Generate client for server-side operations
  amplifyClient = generateClient();
  amplifyAvailable = true;
  console.log('Amplify client configured successfully for signup');
} catch (error) {
  console.error('Error configuring Amplify client for signup:', error);
  amplifyAvailable = false;
}

// Set up DynamoDB client (will be used as a fallback if Amplify is not available)
let dynamoDbAvailable = false;
let docClient: any = null;

try {
  const client = new DynamoDBClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });

  docClient = DynamoDBDocumentClient.from(client);
  dynamoDbAvailable = true;
} catch (error) {
  console.error('Error setting up DynamoDB client:', error);
  dynamoDbAvailable = false;
}

// DynamoDB table name for users
const USERS_TABLE = 'AydoUsers';

// Local storage for users (as a fallback)
const dataDir = path.join(process.cwd(), 'data');
const usersFilePath = path.join(dataDir, 'users.json');

// Helper function to read users from local storage
const getLocalUsers = (): User[] => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([]), 'utf8');
    return [];
  }
  
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data) as User[];
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
};

// Helper function to save users to local storage
const saveLocalUser = (user: User): void => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const users = getLocalUsers();
  
  // Check if user already exists with same id
  const existingUserIndex = users.findIndex(u => u.id === user.id);
  if (existingUserIndex >= 0) {
    // Update existing user
    users[existingUserIndex] = user;
  } else {
    // Add new user
    users.push(user);
  }
  
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const result = signupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { aydoHandle, email, password, discordName, rsiAccountName } = result.data;

    // Check if user already exists - Start with Amplify (primary source)
    let userExists = false;
    
    if (amplifyAvailable && amplifyClient) {
      try {
        // Check by aydoHandle
        const handleResponse = await amplifyClient.models.User.list({
          filter: { aydoHandle: { eq: aydoHandle } }
        });
        
        if (handleResponse.data && handleResponse.data.length > 0) {
          return NextResponse.json(
            { error: 'User with this handle already exists' },
            { status: 409 }
          );
        }

        // Check by email
        const emailResponse = await amplifyClient.models.User.list({
          filter: { email: { eq: email } }
        });
        
        if (emailResponse.data && emailResponse.data.length > 0) {
          return NextResponse.json(
            { error: 'User with this email already exists' },
            { status: 409 }
          );
        }
      } catch (error) {
        console.error('Error checking Amplify for existing user:', error);
        // Continue with other checks
      }
    }
    
    // If not checked in Amplify or check failed, try DynamoDB (secondary)
    if (!userExists && dynamoDbAvailable && docClient) {
      try {
        // Check by aydoHandle
        const handleQueryParams = {
          TableName: USERS_TABLE,
          IndexName: 'AydoHandleIndex',
          KeyConditionExpression: 'aydoHandle = :aydoHandle',
          ExpressionAttributeValues: {
            ':aydoHandle': aydoHandle
          }
        };
        
        const handleResponse = await docClient.send(new QueryCommand(handleQueryParams));
        
        if (handleResponse.Items && handleResponse.Items.length > 0) {
          return NextResponse.json(
            { error: 'User with this handle already exists' },
            { status: 409 }
          );
        }

        // Check by email
        const emailQueryParams = {
          TableName: USERS_TABLE,
          IndexName: 'EmailIndex',
          KeyConditionExpression: 'email = :email',
          ExpressionAttributeValues: {
            ':email': email
          }
        };
        
        const emailResponse = await docClient.send(new QueryCommand(emailQueryParams));
        
        if (emailResponse.Items && emailResponse.Items.length > 0) {
          return NextResponse.json(
            { error: 'User with this email already exists' },
            { status: 409 }
          );
        }
      } catch (error) {
        console.error('Error checking DynamoDB for existing user:', error);
        // Continue with local storage as last resort
      }
    }

    // Finally, check local storage as last resort
    const localUsers = getLocalUsers();
    const existingLocalUser = localUsers.find(u => 
      u.aydoHandle.toLowerCase() === aydoHandle.toLowerCase() || 
      u.email.toLowerCase() === email.toLowerCase()
    );

    if (existingLocalUser) {
      return NextResponse.json(
        { error: 'User with this handle or email already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a unique ID for the user
    const userId = crypto.randomUUID();

    // Create a new user
    const newUser: User = {
      id: userId,
      aydoHandle,
      email,
      passwordHash: hashedPassword,
      clearanceLevel: 1,
      role: 'user',
      discordName: discordName || null,
      rsiAccountName: rsiAccountName || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // First try to save to Amplify (primary storage)
    let savedToAmplify = false;
    if (amplifyAvailable && amplifyClient) {
      try {
        await amplifyClient.models.User.create({
          ...newUser,
          name: aydoHandle, // Add name field needed by Amplify schema
          handle: aydoHandle, // Add handle field needed by Amplify schema
        });
        console.log(`User created in Amplify: ${newUser.aydoHandle}, ${newUser.email}`);
        savedToAmplify = true;
      } catch (error) {
        console.error('Error saving user to Amplify:', error);
        // Continue with other storage methods
      }
    }
    
    // If not saved to Amplify, try to save to DynamoDB 
    let savedToDynamoDB = false;
    if (!savedToAmplify && dynamoDbAvailable && docClient) {
      try {
        const putParams = {
          TableName: USERS_TABLE,
          Item: newUser
        };

        await docClient.send(new PutCommand(putParams));
        console.log(`User saved to DynamoDB: ${newUser.aydoHandle}`);
        savedToDynamoDB = true;
      } catch (dbError) {
        console.error('Error saving user to DynamoDB:', dbError);
        // Continue with local storage
      }
    }

    // As a last resort, save to local storage
    if (!savedToAmplify && !savedToDynamoDB) {
      saveLocalUser(newUser);
      console.log(`User created in local storage: ${newUser.aydoHandle}, ${newUser.email}`);
    }
    
    // Return success response
    return NextResponse.json(
      { 
        success: true,
        message: 'User created successfully',
        user: {
          id: newUser.id,
          aydoHandle: newUser.aydoHandle,
          email: newUser.email,
          clearanceLevel: newUser.clearanceLevel,
          role: newUser.role
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
