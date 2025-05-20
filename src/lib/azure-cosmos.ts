import { CosmosClient } from '@azure/cosmos';
import { User } from '@/types/user';

// Azure Cosmos DB Configuration
const endpoint = process.env.COSMOS_ENDPOINT || '';
const key = process.env.COSMOS_KEY || '';
const databaseId = process.env.COSMOS_DATABASE_ID || '';
const containerId = process.env.COSMOS_CONTAINER_ID || '';

// Initialize Cosmos Client with longer timeout and connection retry options
let client: CosmosClient;
let database: any;
let container: any;

try {
  client = new CosmosClient({
    endpoint,
    key,
    connectionPolicy: {
      requestTimeout: 30000, // 30 seconds timeout
      retryOptions: {
        maxRetryAttemptCount: 5,
        maxWaitTimeInSeconds: 30
      }
    }
  });
  
  database = client.database(databaseId);
  container = database.container(containerId);
  console.log('Cosmos DB client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Cosmos DB client:', error);
}

// Helper function to ensure connection is ready
async function ensureConnection() {
  if (!client || !database || !container) {
    throw new Error('Cosmos DB client not initialized properly');
  }
  
  try {
    // Verify container exists or create it
    await database.containers.createIfNotExists({ 
      id: containerId,
      partitionKey: { paths: ['/id'] }
    });
    return true;
  } catch (error) {
    console.error('Error ensuring Cosmos DB connection:', error);
    throw new Error('Failed to connect to Cosmos DB');
  }
}

// Get a user by ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    await ensureConnection();
    
    try {
      const { resource } = await container.item(id, id).read();
      return resource as User;
    } catch (error: any) {
      // If item not found, return null instead of error
      if (error.code === 404) {
        return null;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

// Get a user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    await ensureConnection();
    
    const querySpec = {
      query: 'SELECT * FROM c WHERE LOWER(c.email) = LOWER(@email)',
      parameters: [{ name: '@email', value: email }]
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
    await ensureConnection();
    
    const querySpec = {
      query: 'SELECT * FROM c WHERE LOWER(c.aydoHandle) = LOWER(@handle)',
      parameters: [{ name: '@handle', value: aydoHandle }]
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
    await ensureConnection();
    
    // Ensure lowercase email to maintain consistency
    user.email = user.email.toLowerCase();
    
    const { resource } = await container.items.create(user);
    console.log('User created successfully:', user.aydoHandle);
    return resource as User;
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    // Provide more detailed error information
    if (error.code === 409) {
      throw new Error('User with this ID already exists');
    } else if (error.code === 403) {
      throw new Error('Permission denied: Unable to create user');
    } else {
      throw new Error(`Failed to create user: ${error.message || 'Unknown error'}`);
    }
  }
}

// Update an existing user
export async function updateUser(id: string, user: Partial<User>): Promise<User | null> {
  try {
    await ensureConnection();
    
    const existingUser = await getUserById(id);
    
    if (!existingUser) {
      return null;
    }
    
    // Log if ships data is included
    if (user.ships) {
      console.log('CosmosDB: Updating ships data for user', id, user.ships.length);
    }
    
    const updatedUser = { ...existingUser, ...user, updatedAt: new Date().toISOString() };
    
    // Explicitly ensure ships are set if provided
    if (user.ships) {
      updatedUser.ships = user.ships;
    }
    
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
    await ensureConnection();
    
    await container.item(id, id).delete();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
  try {
    await ensureConnection();
    
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