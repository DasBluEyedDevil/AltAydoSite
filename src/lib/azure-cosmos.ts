import { CosmosClient } from '@azure/cosmos';
import { User } from '@/types/user';

// Azure Cosmos DB Configuration
const endpoint = process.env.COSMOS_ENDPOINT || '';
const key = process.env.COSMOS_KEY || '';
const databaseId = process.env.COSMOS_DATABASE_ID || '';
const containerId = process.env.COSMOS_CONTAINER_ID || '';

// Initialize Cosmos Client
const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const container = database.container(containerId);

// Get a user by ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const { resource } = await container.item(id, id).read();
    return resource as User;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

// Get a user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.email = @email',
      parameters: [{ name: '@email', value: email.toLowerCase() }]
    };
    
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources.length > 0 ? resources[0] as User : null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

// Get a user by handle
export async function getUserByHandle(aydoHandle: string): Promise<User | null> {
  try {
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.aydoHandle = @handle',
      parameters: [{ name: '@handle', value: aydoHandle.toLowerCase() }]
    };
    
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources.length > 0 ? resources[0] as User : null;
  } catch (error) {
    console.error('Error fetching user by handle:', error);
    return null;
  }
}

// Create a new user
export async function createUser(user: User): Promise<User> {
  try {
    const { resource } = await container.items.create(user);
    return resource as User;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Update an existing user
export async function updateUser(id: string, user: Partial<User>): Promise<User | null> {
  try {
    const existingUser = await getUserById(id);
    
    if (!existingUser) {
      return null;
    }
    
    const updatedUser = { ...existingUser, ...user, updatedAt: new Date().toISOString() };
    const { resource } = await container.item(id, id).replace(updatedUser);
    
    return resource as User;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

// Delete a user
export async function deleteUser(id: string): Promise<void> {
  try {
    await container.item(id, id).delete();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
  try {
    const querySpec = {
      query: 'SELECT * FROM c'
    };
    
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources as User[];
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
} 