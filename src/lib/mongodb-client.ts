import { MongoClient, Collection, ObjectId } from 'mongodb';
import { User } from '@/types/user';

// MongoDB Configuration for Azure Cosmos DB
const mongoUri = process.env.MONGODB_URI;
const endpoint = process.env.COSMOS_ENDPOINT || '';
const key = process.env.COSMOS_KEY || '';
const databaseId = process.env.COSMOS_DATABASE_ID || '';
const collectionId = process.env.COSMOS_CONTAINER_ID || 'users'; // Default to 'users' if not set

// Client instance
let client: MongoClient | null = null;
let userCollection: Collection | null = null;

// Initialize and connect to MongoDB
export async function connect() {
  try {
    if (!client) {
      console.log('Initializing MongoDB client...');
      console.log(`Collection ID from env: "${collectionId}"`);
      
      // Use the provided MongoDB URI if available
      let connectionString = process.env.MONGODB_URI;
      
      // Log whether we have a connection string (without revealing the full value)
      if (connectionString) {
        console.log(`Using MONGODB_URI (starts with: ${connectionString.substring(0, 20)}...)`);
      } else {
        console.log('No MONGODB_URI found, building from components...');
      }
      
      // If no MongoDB URI is provided, try to construct one from individual components
      if (!connectionString) {
        if (!endpoint || !key || !databaseId) {
          throw new Error('Missing MongoDB connection parameters. Please provide either MONGODB_URI or (COSMOS_ENDPOINT, COSMOS_KEY, and COSMOS_DATABASE_ID)');
        }
        
        const username = endpoint.includes('mongo.cosmos.azure.com') ? endpoint.split('.')[0] : 'aydocorp-server';
        const password = encodeURIComponent(key);
        const host = endpoint.replace('https://', '');
        
        // Log connection parameters for debugging (hide sensitive data)
        console.log('Building connection string with:');
        console.log(`- Host: ${host}`);
        console.log(`- Database: ${databaseId}`);
        console.log(`- Username: ${username}`);
        console.log('- Password: [HIDDEN]');
        
        connectionString = `mongodb://${username}:${password}@${host}:10255/${databaseId}?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000`;
        console.log(`Generated connection string (starts with: ${connectionString.substring(0, 20)}...)`);
      }
      
      // Create MongoDB client
      if (!connectionString) {
        throw new Error('Failed to create MongoDB connection string');
      }
      
      console.log('Creating MongoDB client...');
      client = new MongoClient(connectionString);
      
      console.log('Connecting to MongoDB...');
      await client.connect();
      console.log('Connected to MongoDB successfully!');
      
      const db = client.db(databaseId);
      
      // Make sure collection ID is not empty
      if (!collectionId) {
        console.error('Collection ID is empty. Defaulting to "users"');
        userCollection = db.collection('users');
      } else {
        console.log(`Using collection: "${collectionId}"`);
        userCollection = db.collection(collectionId);
      }
      
      console.log('MongoDB client initialized successfully');
      return true;
    }
    return true;
  } catch (error) {
    console.error('Failed to initialize MongoDB client:', error);
    return false;
  }
}

// Helper function to ensure connection is ready
export async function ensureConnection() {
  if (!client || !userCollection) {
    const connected = await connect();
    if (!connected) {
      throw new Error('MongoDB client not initialized properly');
    }
  }
  return true;
}

// Get a user by ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    await ensureConnection();
    
    const user = await userCollection!.findOne({ id });
    if (!user) return null;
    
    // Remove MongoDB's _id field
    const { _id, ...userData } = user;
    return userData as User;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

// Get a user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    await ensureConnection();
    
    // Case-insensitive search for email
    const user = await userCollection!.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });
    
    if (!user) return null;
    
    // Remove MongoDB's _id field
    const { _id, ...userData } = user;
    return userData as User;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

// Get a user by handle
export async function getUserByHandle(aydoHandle: string): Promise<User | null> {
  try {
    await ensureConnection();
    
    // Case-insensitive search for handle
    const user = await userCollection!.findOne({ 
      aydoHandle: { $regex: new RegExp(`^${aydoHandle}$`, 'i') } 
    });
    
    if (!user) return null;
    
    // Remove MongoDB's _id field
    const { _id, ...userData } = user;
    return userData as User;
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
    
    const result = await userCollection!.insertOne(user);
    console.log('User created successfully:', user.aydoHandle);
    return user;
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    // Provide more detailed error information
    if (error.code === 11000) {
      throw new Error('User with this ID already exists');
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
    
    const updatedUser = { 
      ...existingUser, 
      ...user, 
      updatedAt: new Date().toISOString() 
    };
    
    await userCollection!.replaceOne({ id }, updatedUser);
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

// Delete a user
export async function deleteUser(id: string): Promise<void> {
  try {
    await ensureConnection();
    
    await userCollection!.deleteOne({ id });
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
  try {
    await ensureConnection();
    
    const users = await userCollection!.find().toArray();
    // Convert MongoDB documents to User objects
    return users.map(doc => {
      // Remove MongoDB's _id field if it exists
      const { _id, ...userData } = doc;
      return userData as User;
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
}

// Close the connection
export async function close() {
  if (client) {
    await client.close();
    client = null;
    userCollection = null;
    console.log('MongoDB connection closed');
  }
} 