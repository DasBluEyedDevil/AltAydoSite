import { User } from '@/types/user';
import crypto from 'crypto';
import * as mongoDb from './mongodb-client';
import * as localStorage from './local-storage';

// State to track if we should use local storage fallback
let usingFallback = false;
// Flag to prevent repeated connection attempts if we know it's down
let connectionChecked = false;

async function shouldUseFallback(): Promise<boolean> {
  if (usingFallback) return true;
  if (connectionChecked) return false;

  try {
    // Quick check to see if we can connect
    await mongoDb.ensureConnection(1); // 1 retry
    connectionChecked = true;
    return false;
  } catch (error) {
    console.warn('STORAGE: MongoDB connection failed, switching to local fallback storage.');
    usingFallback = true;
    connectionChecked = true;
    return true;
  }
}

// User storage API (MongoDB with Local Fallback)
export async function getUserById(id: string): Promise<User | null> {
  if (await shouldUseFallback()) {
    console.log(`STORAGE: [Local] Getting user by ID: ${id}`);
    return await localStorage.getUserById(id);
  }

  console.log(`STORAGE: [MongoDB] Getting user by ID: ${id}`);
  try {
    return await mongoDb.getUserById(id);
  } catch (error) {
    console.error('STORAGE: [MongoDB] getUserById failed, trying fallback:', error);
    usingFallback = true;
    return await localStorage.getUserById(id);
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (await shouldUseFallback()) {
    console.log(`STORAGE: [Local] Getting user by email: ${email}`);
    return await localStorage.getUserByEmail(email);
  }

  console.log(`STORAGE: [MongoDB] Getting user by email: ${email}`);
  try {
    return await mongoDb.getUserByEmail(email);
  } catch (error) {
    console.error('STORAGE: [MongoDB] getUserByEmail failed, trying fallback:', error);
    usingFallback = true;
    return await localStorage.getUserByEmail(email);
  }
}

export async function getUserByHandle(aydoHandle: string): Promise<User | null> {
  if (await shouldUseFallback()) {
    console.log(`STORAGE: [Local] Getting user by handle: ${aydoHandle}`);
    return await localStorage.getUserByHandle(aydoHandle);
  }

  console.log(`STORAGE: [MongoDB] Getting user by handle: ${aydoHandle}`);
  try {
    return await mongoDb.getUserByHandle(aydoHandle);
  } catch (error) {
    console.error('STORAGE: [MongoDB] getUserByHandle failed, trying fallback:', error);
    usingFallback = true;
    return await localStorage.getUserByHandle(aydoHandle);
  }
}

export async function getUserByDiscordId(discordId: string): Promise<User | null> {
  if (await shouldUseFallback()) {
    console.log(`STORAGE: [Local] Getting user by Discord ID: ${discordId}`);
    return await localStorage.getUserByDiscordId(discordId);
  }

  console.log(`STORAGE: [MongoDB] Getting user by Discord ID: ${discordId}`);
  try {
    return await mongoDb.getUserByDiscordId(discordId);
  } catch (error) {
    console.error('STORAGE: [MongoDB] getUserByDiscordId failed, trying fallback:', error);
    usingFallback = true;
    return await localStorage.getUserByDiscordId(discordId);
  }
}

export async function createUser(user: User): Promise<User> {
  if (!user.id) {
    user.id = crypto.randomUUID();
  }
  if (!user.createdAt) {
    user.createdAt = new Date().toISOString();
  }
  if (!user.updatedAt) {
    user.updatedAt = new Date().toISOString();
  }

  if (await shouldUseFallback()) {
    console.log(`STORAGE: [Local] Creating user: ${user.aydoHandle}`);
    return await localStorage.createUser(user);
  }

  console.log(`STORAGE: [MongoDB] Creating user: ${user.aydoHandle}`);
  try {
    return await mongoDb.createUser(user);
  } catch (error) {
    console.error('STORAGE: [MongoDB] createUser failed, trying fallback:', error);
    usingFallback = true;
    return await localStorage.createUser(user);
  }
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User | null> {
  if (await shouldUseFallback()) {
    console.log(`STORAGE: [Local] Updating user: ${id}`);
    return await localStorage.updateUser(id, userData);
  }

  console.log(`STORAGE: [MongoDB] Updating user: ${id}`);
  try {
    const result = await mongoDb.updateUser(id, userData);
    return result;
  } catch (error) {
    console.error('STORAGE: [MongoDB] updateUser failed, trying fallback:', error);
    usingFallback = true;
    return await localStorage.updateUser(id, userData);
  }
}

export async function deleteUser(id: string): Promise<void> {
  if (await shouldUseFallback()) {
    console.log(`STORAGE: [Local] Deleting user: ${id}`);
    await localStorage.deleteUser(id);
    return;
  }

  console.log(`STORAGE: [MongoDB] Deleting user: ${id}`);
  try {
    await mongoDb.deleteUser(id);
  } catch (error) {
    console.error('STORAGE: [MongoDB] deleteUser failed, trying fallback:', error);
    usingFallback = true;
    await localStorage.deleteUser(id);
  }
}

export async function getAllUsers(): Promise<User[]> {
  if (await shouldUseFallback()) {
    console.log('STORAGE: [Local] Getting all users');
    return await localStorage.getAllUsers();
  }

  console.log('STORAGE: [MongoDB] Getting all users');
  try {
    return await mongoDb.getAllUsers();
  } catch (error) {
    console.error('STORAGE: [MongoDB] getAllUsers failed, trying fallback:', error);
    usingFallback = true;
    return await localStorage.getAllUsers();
  }
}

export function isUsingFallbackStorage(): boolean {
  return usingFallback;
}

export function setFallbackStorageMode(useLocalStorage: boolean) {
  console.log(`STORAGE: Setting fallback storage mode to ${useLocalStorage}`);
  usingFallback = useLocalStorage;
  connectionChecked = true; // Prevent auto-recheck if manually set
}