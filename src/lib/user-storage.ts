import { User } from '@/types/user';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import * as cosmosDb from './azure-cosmos';

// File storage paths
const dataDir = path.join(process.cwd(), 'data');
const usersFilePath = path.join(dataDir, 'users.json');

// Tracking if we had to fall back to local storage
let usingFallbackStorage = false;
let cosmosDbConnectionAttempted = false;
let cosmosDbConnectionFailed = false;

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
  ensureDataDir();
  
  const users = getLocalUsers();
  
  // Check if user already exists
  const existingUserIndex = users.findIndex(u => u.id === user.id);
  if (existingUserIndex >= 0) {
    // Update existing user
    console.log(`STORAGE: Updating existing user: ${user.aydoHandle}`);
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

// Function to check if we should use Cosmos DB or local storage
async function shouldUseCosmosDb(): Promise<boolean> {
  if (cosmosDbConnectionAttempted) {
    console.log(`STORAGE: Using ${cosmosDbConnectionFailed ? 'local storage (fallback)' : 'Cosmos DB'} based on previous attempt`);
    return !cosmosDbConnectionFailed;
  }
  
  try {
    console.log('STORAGE: Testing Cosmos DB connection...');
    cosmosDbConnectionAttempted = true;
    // Try to get all users from Cosmos DB as a test
    await cosmosDb.getAllUsers();
    console.log('STORAGE: Successfully connected to Cosmos DB');
    return true;
  } catch (error) {
    console.error('STORAGE: Failed to connect to Cosmos DB, falling back to local storage:', error);
    cosmosDbConnectionFailed = true;
    usingFallbackStorage = true;
    return false;
  }
}

// User storage API
export async function getUserById(id: string): Promise<User | null> {
  console.log(`STORAGE: Getting user by ID: ${id}`);
  
  if (await shouldUseCosmosDb()) {
    try {
      return await cosmosDb.getUserById(id);
    } catch (error) {
      console.error('STORAGE: Cosmos DB getUserById failed, falling back to local storage:', error);
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
  
  if (await shouldUseCosmosDb()) {
    try {
      return await cosmosDb.getUserByEmail(email);
    } catch (error) {
      console.error('STORAGE: Cosmos DB getUserByEmail failed, falling back to local storage:', error);
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
  
  if (await shouldUseCosmosDb()) {
    try {
      return await cosmosDb.getUserByHandle(aydoHandle);
    } catch (error) {
      console.error('STORAGE: Cosmos DB getUserByHandle failed, falling back to local storage:', error);
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
  
  if (await shouldUseCosmosDb()) {
    try {
      return await cosmosDb.createUser(user);
    } catch (error) {
      console.error('STORAGE: Cosmos DB createUser failed, falling back to local storage:', error);
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
  
  if (await shouldUseCosmosDb()) {
    try {
      return await cosmosDb.updateUser(id, userData);
    } catch (error) {
      console.error('STORAGE: Cosmos DB updateUser failed, falling back to local storage:', error);
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
  
  const updatedUser = {
    ...users[userIndex],
    ...userData,
    updatedAt: new Date().toISOString()
  };
  
  saveLocalUser(updatedUser);
  return updatedUser;
}

export async function deleteUser(id: string): Promise<void> {
  console.log(`STORAGE: Deleting user: ${id}`);
  
  if (await shouldUseCosmosDb()) {
    try {
      await cosmosDb.deleteUser(id);
      return;
    } catch (error) {
      console.error('STORAGE: Cosmos DB deleteUser failed, falling back to local storage:', error);
      usingFallbackStorage = true;
    }
  }
  
  // Fallback to local storage
  console.log(`STORAGE: Deleting user from local storage: ${id}`);
  deleteLocalUser(id);
}

export async function getAllUsers(): Promise<User[]> {
  console.log('STORAGE: Getting all users');
  
  if (await shouldUseCosmosDb()) {
    try {
      return await cosmosDb.getAllUsers();
    } catch (error) {
      console.error('STORAGE: Cosmos DB getAllUsers failed, falling back to local storage:', error);
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
  cosmosDbConnectionFailed = useLocalStorage;
  cosmosDbConnectionAttempted = true;
  return usingFallbackStorage;
} 