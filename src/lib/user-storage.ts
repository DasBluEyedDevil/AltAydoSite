import { User } from '@/types/user';
import crypto from 'crypto';
import * as mongoDb from './mongodb-client';

// User storage API (MongoDB only)
export async function getUserById(id: string): Promise<User | null> {
  console.log(`STORAGE: [MongoDB] Getting user by ID: ${id}`);
  try {
    return await mongoDb.getUserById(id);
  } catch (error) {
    console.error('STORAGE: [MongoDB] getUserById failed:', error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  console.log(`STORAGE: [MongoDB] Getting user by email: ${email}`);
  try {
    return await mongoDb.getUserByEmail(email);
  } catch (error) {
    console.error('STORAGE: [MongoDB] getUserByEmail failed:', error);
    return null;
  }
}

export async function getUserByHandle(aydoHandle: string): Promise<User | null> {
  console.log(`STORAGE: [MongoDB] Getting user by handle: ${aydoHandle}`);
  try {
    return await mongoDb.getUserByHandle(aydoHandle);
  } catch (error) {
    console.error('STORAGE: [MongoDB] getUserByHandle failed:', error);
    return null;
  }
}

export async function getUserByDiscordId(discordId: string): Promise<User | null> {
  console.log(`STORAGE: [MongoDB] Getting user by Discord ID: ${discordId}`);
  try {
    return await mongoDb.getUserByDiscordId(discordId);
  } catch (error) {
    console.error('STORAGE: [MongoDB] getUserByDiscordId failed:', error);
    return null;
  }
}

export async function createUser(user: User): Promise<User> {
  console.log(`STORAGE: [MongoDB] Creating user: ${user.aydoHandle}`);
  if (!user.id) {
    user.id = crypto.randomUUID();
    console.log(`STORAGE: Generated new ID for user: ${user.id}`);
  }
  if (!user.createdAt) {
    user.createdAt = new Date().toISOString();
  }
  if (!user.updatedAt) {
    user.updatedAt = new Date().toISOString();
  }
  const created = await mongoDb.createUser(user);
  return created;
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User | null> {
  console.log(`STORAGE: [MongoDB] Updating user: ${id}`);
  try {
    const result = await mongoDb.updateUser(id, userData);
    return result;
  } catch (error) {
    console.error('STORAGE: [MongoDB] updateUser failed:', error);
    return null;
  }
}

export async function deleteUser(id: string): Promise<void> {
  console.log(`STORAGE: [MongoDB] Deleting user: ${id}`);
  await mongoDb.deleteUser(id);
}

export async function getAllUsers(): Promise<User[]> {
  console.log('STORAGE: [MongoDB] Getting all users');
  try {
    return await mongoDb.getAllUsers();
  } catch (error) {
    console.error('STORAGE: [MongoDB] getAllUsers failed:', error);
    return [];
  }
}

export function isUsingFallbackStorage(): boolean {
  return false;
}

export function setFallbackStorageMode(_useLocalStorage: boolean) {
  console.log('STORAGE: Fallback storage mode is disabled.');
}