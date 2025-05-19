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
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([]), 'utf8');
  }
}

function getLocalUsers(): User[] {
  ensureDataDir();
  
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data) as User[];
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

function saveLocalUser(user: User): void {
  ensureDataDir();
  
  const users = getLocalUsers();
  
  // Check if user already exists
  const existingUserIndex = users.findIndex(u => u.id === user.id);
  if (existingUserIndex >= 0) {
    // Update existing user
    users[existingUserIndex] = user;
  } else {
    // Add new user
    users.push(user);
  }
  
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
}

function deleteLocalUser(id: string): void {
  ensureDataDir();
  
  const users = getLocalUsers();
  const filteredUsers = users.filter(u => u.id !== id);
  
  fs.writeFileSync(usersFilePath, JSON.stringify(filteredUsers, null, 2), 'utf8');
}

// Function to check if we should use Cosmos DB or local storage
async function shouldUseCosmosDb(): Promise<boolean> {
  if (cosmosDbConnectionAttempted) {
    return !cosmosDbConnectionFailed;
  }
  
  try {
    cosmosDbConnectionAttempted = true;
    // Try to get all users from Cosmos DB as a test
    await cosmosDb.getAllUsers();
    console.log('Successfully connected to Cosmos DB');
    return true;
  } catch (error) {
    console.error('Failed to connect to Cosmos DB, falling back to local storage:', error);
    cosmosDbConnectionFailed = true;
    usingFallbackStorage = true;
    return false;
  }
}

// User storage API
export async function getUserById(id: string): Promise<User | null> {
  if (await shouldUseCosmosDb()) {
    try {
      return await cosmosDb.getUserById(id);
    } catch (error) {
      console.error('Cosmos DB getUserById failed, falling back to local storage:', error);
      usingFallbackStorage = true;
    }
  }
  
  // Fallback to local storage
  const users = getLocalUsers();
  return users.find(u => u.id === id) || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (await shouldUseCosmosDb()) {
    try {
      return await cosmosDb.getUserByEmail(email);
    } catch (error) {
      console.error('Cosmos DB getUserByEmail failed, falling back to local storage:', error);
      usingFallbackStorage = true;
    }
  }
  
  // Fallback to local storage
  const users = getLocalUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getUserByHandle(aydoHandle: string): Promise<User | null> {
  if (await shouldUseCosmosDb()) {
    try {
      return await cosmosDb.getUserByHandle(aydoHandle);
    } catch (error) {
      console.error('Cosmos DB getUserByHandle failed, falling back to local storage:', error);
      usingFallbackStorage = true;
    }
  }
  
  // Fallback to local storage
  const users = getLocalUsers();
  return users.find(u => u.aydoHandle.toLowerCase() === aydoHandle.toLowerCase()) || null;
}

export async function createUser(user: User): Promise<User> {
  // Ensure user has an ID
  if (!user.id) {
    user.id = crypto.randomUUID();
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
      console.error('Cosmos DB createUser failed, falling back to local storage:', error);
      usingFallbackStorage = true;
    }
  }
  
  // Fallback to local storage
  saveLocalUser(user);
  return user;
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User | null> {
  if (await shouldUseCosmosDb()) {
    try {
      return await cosmosDb.updateUser(id, userData);
    } catch (error) {
      console.error('Cosmos DB updateUser failed, falling back to local storage:', error);
      usingFallbackStorage = true;
    }
  }
  
  // Fallback to local storage
  const users = getLocalUsers();
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
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
  if (await shouldUseCosmosDb()) {
    try {
      await cosmosDb.deleteUser(id);
      return;
    } catch (error) {
      console.error('Cosmos DB deleteUser failed, falling back to local storage:', error);
      usingFallbackStorage = true;
    }
  }
  
  // Fallback to local storage
  deleteLocalUser(id);
}

export async function getAllUsers(): Promise<User[]> {
  if (await shouldUseCosmosDb()) {
    try {
      return await cosmosDb.getAllUsers();
    } catch (error) {
      console.error('Cosmos DB getAllUsers failed, falling back to local storage:', error);
      usingFallbackStorage = true;
    }
  }
  
  // Fallback to local storage
  return getLocalUsers();
}

export function isUsingFallbackStorage(): boolean {
  return usingFallbackStorage;
} 