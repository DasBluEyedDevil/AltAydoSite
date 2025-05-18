import { User } from '@/types/user';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

// Local storage for users
const dataDir = path.join(process.cwd(), 'data');
const usersFilePath = path.join(dataDir, 'users.json');

// Function to check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

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

  // Save to local storage
  saveLocalUser(newUser);
  console.log('User created in local storage');
  
  return newUser;
};

// Function to get a user by handle
export const getUserByHandle = async (aydoHandle: string): Promise<User | null> => {
  // Get from local storage
  const users = getLocalUsers();
  return users.find(u => u.aydoHandle.toLowerCase() === aydoHandle.toLowerCase()) || null;
};

// Function to get a user by email
export const getUserByEmail = async (email: string): Promise<User | null> => {
  // Get from local storage
  const users = getLocalUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
};

// Function to update a user
export const updateUser = async (
  userId: string,
  updates: Partial<Omit<User, 'id'>>
): Promise<User | null> => {
  // Get all users
  const users = getLocalUsers();
  
  // Find the user to update
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    console.error(`User with ID ${userId} not found`);
    return null;
  }
  
  // Update the user
  const user = users[userIndex];
  const updatedUser: User = {
    ...user,
    ...updates,
    id: userId, // ensure ID isn't changed
    updatedAt: new Date().toISOString()
  };
  
  // Save the updated user
  users[userIndex] = updatedUser;
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
  
  return updatedUser;
};

// Function to delete a user
export const deleteUser = async (userId: string): Promise<boolean> => {
  // Get all users
  const users = getLocalUsers();
  
  // Find the user to delete
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    console.error(`User with ID ${userId} not found`);
    return false;
  }
  
  // Remove the user
  users.splice(userIndex, 1);
  
  // Save the updated users list
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
  
  return true;
};

// Function to get all users
export const getAllUsers = async (): Promise<User[]> => {
  return getLocalUsers();
};

// Admin functions

// Promote a user (increase clearance level)
export const promoteUser = async (userId: string): Promise<User | null> => {
  const users = getLocalUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    console.error(`User with ID ${userId} not found`);
    return null;
  }
  
  const user = users[userIndex];
  
  // Maximum clearance level is 5
  if (user.clearanceLevel >= 5) {
    console.log(`User ${user.aydoHandle} already at maximum clearance level`);
    return user;
  }
  
  // Increase clearance level
  const updatedUser: User = {
    ...user,
    clearanceLevel: user.clearanceLevel + 1,
    updatedAt: new Date().toISOString()
  };
  
  // Save the updated user
  users[userIndex] = updatedUser;
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
  
  return updatedUser;
};

// Demote a user (decrease clearance level)
export const demoteUser = async (userId: string): Promise<User | null> => {
  const users = getLocalUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    console.error(`User with ID ${userId} not found`);
    return null;
  }
  
  const user = users[userIndex];
  
  // Minimum clearance level is 1
  if (user.clearanceLevel <= 1) {
    console.log(`User ${user.aydoHandle} already at minimum clearance level`);
    return user;
  }
  
  // Decrease clearance level
  const updatedUser: User = {
    ...user,
    clearanceLevel: user.clearanceLevel - 1,
    updatedAt: new Date().toISOString()
  };
  
  // Save the updated user
  users[userIndex] = updatedUser;
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
  
  return updatedUser;
}; 