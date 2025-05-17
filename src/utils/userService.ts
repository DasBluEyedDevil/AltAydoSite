import { User } from '@/types/user';
import fs from 'fs';
import path from 'path';
import { generateClient } from 'aws-amplify/data';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Amplify } from 'aws-amplify';

// Local storage for users
const dataDir = path.join(process.cwd(), 'data');
const usersFilePath = path.join(dataDir, 'users.json');

// Function to check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Try to initialize Amplify client for environments
let amplifyClient: any = null;

// Helper function to read users from local storage (server-side only)
export const getLocalUsers = (): User[] => {
  // Only run on server
  if (isBrowser) return [];

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

// Helper function to save a user to local storage (server-side only)
export const saveLocalUser = (user: User): void => {
  // Only run on server
  if (isBrowser) return;

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

// Configure Amplify and create client
const initializeAmplify = () => {
  if (amplifyClient) return amplifyClient;
  
  try {
    // Configure Amplify if not already configured
    if (isBrowser) {
      // In browser, Amplify is configured by AmplifyProvider component
      amplifyClient = generateClient();
    } else {
      // In server environment, configure Amplify directly
      Amplify.configure({
        API: {
          GraphQL: {
            endpoint: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '',
            apiKey: process.env.NEXT_PUBLIC_GRAPHQL_API_KEY || '',
            region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
            defaultAuthMode: 'apiKey',
          },
        },
      });
      amplifyClient = generateClient();
    }
    
    return amplifyClient;
  } catch (error) {
    console.error('Error initializing Amplify client:', error);
    return null;
  }
};

// Function to create a user
export const createUser = async (
  userData: {
    aydoHandle: string;
    email: string;
    password: string;
    discordName?: string | null;
    rsiAccountName?: string | null;
  }
): Promise<User> => {
  // Hash the password
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // Create a unique ID for the user
  const userId = crypto.randomUUID();

  // Create new user object
  const newUser: User = {
    id: userId,
    aydoHandle: userData.aydoHandle,
    email: userData.email,
    passwordHash: hashedPassword,
    clearanceLevel: 1,
    role: 'user',
    discordName: userData.discordName || null,
    rsiAccountName: userData.rsiAccountName || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Try to save to Amplify (primary storage)
  const client = initializeAmplify();
  let savedToAmplify = false;
  
  if (client) {
    try {
      await client.models.User.create({
        ...newUser,
        name: userData.aydoHandle, // Add name field needed by Amplify schema
        handle: userData.aydoHandle, // Add handle field needed by Amplify schema
      });
      console.log('User created in Amplify');
      savedToAmplify = true;
    } catch (error) {
      console.error('Error creating user in Amplify:', error);
      // Fall through to local storage
    }
  }

  // If Amplify failed or not available, save to local storage
  if (!savedToAmplify) {
    saveLocalUser(newUser);
    console.log('User created in local storage');
  }
  
  return newUser;
};

// Function to get a user by handle
export const getUserByHandle = async (aydoHandle: string): Promise<User | null> => {
  // Try to get from Amplify (primary source)
  const client = initializeAmplify();
  
  if (client) {
    try {
      const response = await client.models.User.list({
        filter: { aydoHandle: { eq: aydoHandle } }
      });
      
      if (response.data && response.data.length > 0) {
        const amplifyUser = response.data[0];
        // Convert to our User type
        return {
          id: amplifyUser.id,
          aydoHandle: amplifyUser.aydoHandle,
          email: amplifyUser.email,
          passwordHash: amplifyUser.passwordHash,
          clearanceLevel: amplifyUser.clearanceLevel,
          role: amplifyUser.role,
          discordName: amplifyUser.discordName || null,
          rsiAccountName: amplifyUser.rsiAccountName || null,
          createdAt: amplifyUser.createdAt,
          updatedAt: amplifyUser.updatedAt
        };
      }
    } catch (error) {
      console.error('Error getting user from Amplify:', error);
      // Fall through to local storage
    }
  }

  // Try local storage as fallback
  const users = getLocalUsers();
  return users.find(u => u.aydoHandle.toLowerCase() === aydoHandle.toLowerCase()) || null;
};

// Function to get a user by email
export const getUserByEmail = async (email: string): Promise<User | null> => {
  // Try to get from Amplify (primary source)
  const client = initializeAmplify();
  
  if (client) {
    try {
      const response = await client.models.User.list({
        filter: { email: { eq: email } }
      });
      
      if (response.data && response.data.length > 0) {
        const amplifyUser = response.data[0];
        // Convert to our User type
        return {
          id: amplifyUser.id,
          aydoHandle: amplifyUser.aydoHandle,
          email: amplifyUser.email,
          passwordHash: amplifyUser.passwordHash,
          clearanceLevel: amplifyUser.clearanceLevel,
          role: amplifyUser.role,
          discordName: amplifyUser.discordName || null,
          rsiAccountName: amplifyUser.rsiAccountName || null,
          createdAt: amplifyUser.createdAt,
          updatedAt: amplifyUser.updatedAt
        };
      }
    } catch (error) {
      console.error('Error getting user from Amplify:', error);
      // Fall through to local storage
    }
  }

  // Try local storage as fallback
  const users = getLocalUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
};

// Function to update a user
export const updateUser = async (
  userId: string,
  updates: Partial<Omit<User, 'id'>>
): Promise<User | null> => {
  // Try to update in Amplify (primary source)
  const client = initializeAmplify();
  
  if (client) {
    try {
      // First get the current user
      const response = await client.models.User.get({ id: userId });
      
      if (response) {
        // Update the user
        const updatedUser = await client.models.User.update({
          id: userId,
          ...updates,
          updatedAt: new Date().toISOString()
        });
        
        // Convert to our User type
        return {
          id: updatedUser.id,
          aydoHandle: updatedUser.aydoHandle,
          email: updatedUser.email,
          passwordHash: updatedUser.passwordHash,
          clearanceLevel: updatedUser.clearanceLevel,
          role: updatedUser.role,
          discordName: updatedUser.discordName || null,
          rsiAccountName: updatedUser.rsiAccountName || null,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        };
      }
    } catch (error) {
      console.error('Error updating user in Amplify:', error);
      // Fall through to local storage
    }
  }

  // Try local storage as fallback
  const users = getLocalUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return null;
  }
  
  // Update the user
  const updatedUser = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  users[userIndex] = updatedUser;
  
  // Save to local storage
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
  
  return updatedUser;
}; 