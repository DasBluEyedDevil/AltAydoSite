import { User } from '@/types/user';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import * as mongoDb from './mongodb-client';

// File storage paths
const dataDir = path.join(process.cwd(), 'data');
const usersFilePath = path.join(dataDir, 'users.json');

// Tracking if we had to fall back to local storage
let usingFallbackStorage = false; // Set back to false to try MongoDB first
let mongoDbConnectionAttempted = false;
let mongoDbConnectionFailed = false; // Reset to false to try MongoDB connection

// Helper functions for local file storage
function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    console.log(`STORAGE: Creating data directory: ${dataDir}`);
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(usersFilePath)) {
    console.log(`STORAGE: Creating empty users file: ${usersFilePath}`);
    fs.writeFileSync(usersFilePath, JSON.stringify([]), 'utf8');
  }
}

function getLocalUsers(): User[] {
  console.log('STORAGE: Reading users from local storage');
  ensureDataDir();
  
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    const users = JSON.parse(data) as User[];
    console.log(`STORAGE: Found ${users.length} users in local storage`);
    
    // Log first few users for debugging (without sensitive info)
    if (users.length > 0) {
      console.log('STORAGE: Sample users:', users.slice(0, 3).map(user => ({
        id: user.id,
        aydoHandle: user.aydoHandle,
        email: user.email,
        hasPassword: !!user.passwordHash,
        passwordHashLength: user.passwordHash ? user.passwordHash.length : 0
      })));
    }
    
    return users;
  } catch (error) {
    console.error('STORAGE: Error reading users file:', error);
    return [];
  }
}

function saveLocalUser(user: User): void {
  console.log(`STORAGE: Saving user to local storage: ${user.aydoHandle}`);
  console.log(`STORAGE: User has ${user.ships?.length || 0} ships`);
  ensureDataDir();
  
  const users = getLocalUsers();
  
  // Check if user already exists
  const existingUserIndex = users.findIndex(u => u.id === user.id);
  if (existingUserIndex >= 0) {
    // Update existing user
    console.log(`STORAGE: Updating existing user: ${user.aydoHandle}`);
    
    // Check if this is a ships update
    if (user.ships) {
      const oldShipsCount = users[existingUserIndex].ships?.length || 0;
      const newShipsCount = user.ships.length;
      console.log(`STORAGE: Ships count changing from ${oldShipsCount} to ${newShipsCount}`);
      
      // Ensure ships are properly set
      users[existingUserIndex].ships = user.ships;
    }
    
    users[existingUserIndex] = user;
  } else {
    // Add new user
    console.log(`STORAGE: Adding new user: ${user.aydoHandle}`);
    users.push(user);
  }
  
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
  console.log(`STORAGE: Successfully saved users to file, total count: ${users.length}`);
}

function deleteLocalUser(id: string): void {
  console.log(`STORAGE: Deleting user from local storage: ${id}`);
  ensureDataDir();
  
  const users = getLocalUsers();
  const filteredUsers = users.filter(u => u.id !== id);
  
  fs.writeFileSync(usersFilePath, JSON.stringify(filteredUsers, null, 2), 'utf8');
  console.log(`STORAGE: User deleted from local storage, remaining users: ${filteredUsers.length}`);
}

// Function to check if we should use MongoDB or local storage
async function shouldUseMongoDb(): Promise<boolean> {
  if (mongoDbConnectionAttempted) {
    console.log(`STORAGE: Using ${mongoDbConnectionFailed ? 'local storage (fallback)' : 'MongoDB'} based on previous attempt`);
    return !mongoDbConnectionFailed;
  }
  
  try {
    // Check if either MongoDB connection string is available
    const mongoUri = process.env.MONGODB_URI || process.env.COSMOSDB_CONNECTION_STRING;
    
    if (!mongoUri) {
      console.warn('STORAGE: No MongoDB URI found in environment variables');
      mongoDbConnectionFailed = true;
      usingFallbackStorage = true;
      return false;
    }
    
    console.log('STORAGE: Testing MongoDB connection...');
    mongoDbConnectionAttempted = true;
    
    // Try to get all users from MongoDB as a test
    await mongoDb.getAllUsers();
    console.log('STORAGE: Successfully connected to MongoDB');
    return true;
  } catch (error) {
    console.error('STORAGE: Failed to connect to MongoDB, falling back to local storage:', error);
    mongoDbConnectionFailed = true;
    usingFallbackStorage = true;
    return false;
  }
}

// User storage API
export async function getUserById(id: string): Promise<User | null> {
  console.log(`STORAGE: Getting user by ID: ${id}`);
  
  if (await shouldUseMongoDb()) {
    try {
      return await mongoDb.getUserById(id);
    } catch (error) {
      console.error('STORAGE: MongoDB getUserById failed, falling back to local storage:', error);
      usingFallbackStorage = true;
    }
  }
  
  // Fallback to local storage
  console.log(`STORAGE: Getting user by ID from local storage: ${id}`);
  const users = getLocalUsers();
  const user = users.find(u => u.id === id) || null;
  console.log(`STORAGE: ${user ? 'Found' : 'Did not find'} user with ID: ${id}`);
  return user;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  console.log(`STORAGE: Getting user by email: ${email}`);
  
  if (await shouldUseMongoDb()) {
    try {
      return await mongoDb.getUserByEmail(email);
    } catch (error) {
      console.error('STORAGE: MongoDB getUserByEmail failed, falling back to local storage:', error);
      usingFallbackStorage = true;
    }
  }
  
  // Fallback to local storage
  console.log(`STORAGE: Getting user by email from local storage: ${email}`);
  const users = getLocalUsers();
  const normalizedEmail = email.toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail) || null;
  console.log(`STORAGE: ${user ? 'Found' : 'Did not find'} user with email: ${email}`);
  return user;
}

export async function getUserByHandle(aydoHandle: string): Promise<User | null> {
  console.log(`STORAGE: Getting user by handle: ${aydoHandle}`);
  
  if (await shouldUseMongoDb()) {
    try {
      return await mongoDb.getUserByHandle(aydoHandle);
    } catch (error) {
      console.error('STORAGE: MongoDB getUserByHandle failed, falling back to local storage:', error);
      usingFallbackStorage = true;
    }
  }
  
  // Fallback to local storage
  console.log(`STORAGE: Getting user by handle from local storage: ${aydoHandle}`);
  const users = getLocalUsers();
  const normalizedHandle = aydoHandle.toLowerCase();
  const user = users.find(u => u.aydoHandle.toLowerCase() === normalizedHandle) || null;
  console.log(`STORAGE: ${user ? 'Found' : 'Did not find'} user with handle: ${aydoHandle}`);
  
  if (user) {
    console.log('STORAGE: User details:', {
      id: user.id,
      aydoHandle: user.aydoHandle,
      email: user.email,
      hasPasswordHash: !!user.passwordHash,
      passwordHashLength: user.passwordHash ? user.passwordHash.length : 0
    });
  }
  
  return user;
}

export async function createUser(user: User): Promise<User> {
  console.log(`STORAGE: Creating user: ${user.aydoHandle}`);
  
  // Ensure user has an ID
  if (!user.id) {
    user.id = crypto.randomUUID();
    console.log(`STORAGE: Generated new ID for user: ${user.id}`);
  }
  
  // Set timestamps if not present
  if (!user.createdAt) {
    user.createdAt = new Date().toISOString();
  }
  if (!user.updatedAt) {
    user.updatedAt = new Date().toISOString();
  }
  
  if (await shouldUseMongoDb()) {
    try {
      return await mongoDb.createUser(user);
    } catch (error) {
      console.error('STORAGE: MongoDB createUser failed, falling back to local storage:', error);
      usingFallbackStorage = true;
    }
  }
  
  // Fallback to local storage
  console.log(`STORAGE: Creating user in local storage: ${user.aydoHandle}`);
  saveLocalUser(user);
  return user;
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User | null> {
  console.log(`STORAGE: Updating user: ${id}`);
  console.log('STORAGE: Update data includes ships:', userData.ships !== undefined);
  console.log('STORAGE: Update data includes timezone:', userData.timezone !== undefined);
  console.log('STORAGE: Update fields:', Object.keys(userData));
  
  if (userData.ships) {
    console.log(`STORAGE: Ships data in update has ${userData.ships.length} ships`);
    console.log('STORAGE: First few ships:', userData.ships.slice(0, 2));
  }
  
  if (userData.timezone !== undefined) {
    console.log('STORAGE: Timezone in update:', userData.timezone);
  }
  
  if (await shouldUseMongoDb()) {
    try {
      const result = await mongoDb.updateUser(id, userData);
      if (result && userData.timezone !== undefined) {
        console.log('STORAGE: MongoDB update successful, returned timezone:', result.timezone);
      }
      return result;
    } catch (error) {
      console.error('STORAGE: MongoDB updateUser failed, falling back to local storage:', error);
      usingFallbackStorage = true;
    }
  }
  
  // Fallback to local storage
  console.log(`STORAGE: Updating user in local storage: ${id}`);
  const users = getLocalUsers();
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    console.log(`STORAGE: User not found for update: ${id}`);
    return null;
  }
  
  // Log existing user data
  console.log(`STORAGE: Existing user has ${users[userIndex].ships?.length || 0} ships before update`);
  console.log(`STORAGE: Existing user timezone before update:`, users[userIndex].timezone);
  
  const updatedUser = {
    ...users[userIndex],
    ...userData,
    updatedAt: new Date().toISOString()
  };
  
  // Explicitly handle special fields
  if (userData.ships) {
    console.log('STORAGE: Updating ships for user:', userData.ships);
    console.log(`STORAGE: Ships count in update data: ${userData.ships.length}`);
    // Ensure ships are properly set
    updatedUser.ships = userData.ships;
  }
  
  if (userData.timezone !== undefined) {
    console.log('STORAGE: Updating timezone for user:', userData.timezone);
    updatedUser.timezone = userData.timezone;
  }
  
  // Log the updated user data
  console.log(`STORAGE: Updated user ships count: ${updatedUser.ships?.length || 0}`);
  console.log(`STORAGE: Updated user timezone: ${updatedUser.timezone}`);
  
  saveLocalUser(updatedUser);
  console.log('STORAGE: User updated in local storage - final timezone:', updatedUser.timezone);
  return updatedUser;
}

export async function deleteUser(id: string): Promise<void> {
  console.log(`STORAGE: Deleting user: ${id}`);
  
  if (await shouldUseMongoDb()) {
    try {
      await mongoDb.deleteUser(id);
      return;
    } catch (error) {
      console.error('STORAGE: MongoDB deleteUser failed, falling back to local storage:', error);
      usingFallbackStorage = true;
    }
  }
  
  // Fallback to local storage
  console.log(`STORAGE: Deleting user from local storage: ${id}`);
  deleteLocalUser(id);
}

export async function getAllUsers(): Promise<User[]> {
  console.log('STORAGE: Getting all users');
  
  if (await shouldUseMongoDb()) {
    try {
      return await mongoDb.getAllUsers();
    } catch (error) {
      console.error('STORAGE: MongoDB getAllUsers failed, falling back to local storage:', error);
      usingFallbackStorage = true;
    }
  }
  
  // Fallback to local storage
  console.log('STORAGE: Getting all users from local storage');
  return getLocalUsers();
}

export function isUsingFallbackStorage(): boolean {
  return usingFallbackStorage;
}

export function setFallbackStorageMode(useLocalStorage: boolean) {
  console.log(`STORAGE: Explicitly ${useLocalStorage ? 'enabling' : 'disabling'} fallback storage mode`);
  usingFallbackStorage = useLocalStorage;
  mongoDbConnectionAttempted = true;
  mongoDbConnectionFailed = useLocalStorage;
} 