import { MongoClient, Collection, ObjectId } from 'mongodb';
import { User } from '@/types/user';
import { PasswordResetToken } from '@/types/password-reset';

// MongoDB Configuration
const mongoUri = process.env.MONGODB_URI || process.env.COSMOSDB_CONNECTION_STRING;
const databaseId = process.env.COSMOS_DATABASE_ID || 'aydocorp-database';
const collectionId = process.env.COSMOS_CONTAINER_ID || 'users';
const resetTokensCollectionId = 'resetTokens';

// Log connection details (safely)
if (mongoUri) {
  const sanitizedUri = mongoUri.replace(/\/\/[^@]+@/, '//[credentials]@');
  console.log(`MongoDB URI found, starting with: ${sanitizedUri.substring(0, 40)}...`);
} else {
  console.warn('No MongoDB URI found in environment variables');
}

// Client instance
let client: MongoClient | null = null;
let userCollection: Collection | null = null;
let resetTokenCollection: Collection | null = null;

// Initialize and connect to MongoDB
export async function connect() {
  try {
    if (!client) {
      console.log('Initializing MongoDB client...');
      console.log(`Database ID: "${databaseId}"`);
      console.log(`Collection ID: "${collectionId}"`);
      
      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is required');
      }

      // Log connection attempt (safely)
      const sanitizedUri = mongoUri.replace(/\/\/[^@]+@/, '//[credentials]@');
      console.log(`Connecting to MongoDB with URI starting with: ${sanitizedUri.substring(0, 50)}...`);
      
      // Create MongoDB client with vCore-specific options
      client = new MongoClient(mongoUri, {
        connectTimeoutMS: 30000, // 30 seconds
        socketTimeoutMS: 30000,
        serverSelectionTimeoutMS: 30000,
        maxPoolSize: 100,
        minPoolSize: 0,
        maxIdleTimeMS: 120000,
        waitQueueTimeoutMS: 30000,
      });
      
      console.log('Connecting to MongoDB...');
      await client.connect();
      console.log('Connected to MongoDB successfully!');
      
      // Get database reference
      const db = client.db(databaseId);
      
      // Initialize collections first
      userCollection = db.collection(collectionId);
      resetTokenCollection = db.collection(resetTokensCollectionId);
      
      // List collections for verification
      try {
        const collections = await db.listCollections().toArray();
        console.log('Available collections:', collections.map(col => col.name).join(', '));
      } catch (error) {
        console.warn('Unable to list collections (this is normal for fresh databases):', error);
      }
      
      // Verify collection access with retries
      let retries = 3;
      while (retries > 0) {
        try {
          // Simple query to verify access
          await userCollection.findOne({}, { projection: { _id: 1 } });
          console.log('Successfully verified users collection access');
          break;
        } catch (error) {
          console.error(`Collection access attempt failed (${retries} retries left):`, error);
          if (retries === 1) {
            // Last retry, attempt to create collection
            try {
              await db.createCollection(collectionId);
              userCollection = db.collection(collectionId);
              console.log('Created new users collection');
              break;
            } catch (createError) {
              if ((createError as any).code === 48) { // Collection already exists
                console.log('Collection already exists, proceeding...');
                break;
              }
              throw createError;
            }
          }
          retries--;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between retries
        }
      }
      
      // Final verification that collections are initialized
      if (!userCollection || !resetTokenCollection) {
        throw new Error('Failed to initialize MongoDB collections');
      }
      
      console.log('MongoDB client initialized successfully');
      return true;
    }
    return true;
  } catch (error) {
    console.error('Failed to initialize MongoDB client:', error);
    // Reset client and collections on error
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('Error closing client:', closeError);
      }
    }
    client = null;
    userCollection = null;
    resetTokenCollection = null;
    return false;
  }
}

// Helper function to ensure connection is ready with retries
export async function ensureConnection(retries = 3): Promise<boolean> {
  while (retries > 0) {
    try {
      if (!client || !userCollection) {
        const connected = await connect();
        if (!connected) {
          throw new Error('MongoDB client not initialized properly');
        }
      }
      // Verify connection is still alive
      await client!.db().command({ ping: 1 });
      return true;
    } catch (error) {
      console.error(`Connection check failed (${retries} retries left):`, error);
      // Reset client on error
      if (client) {
        try {
          await client.close();
        } catch (closeError) {
          console.error('Error closing client:', closeError);
        }
      }
      client = null;
      userCollection = null;
      resetTokenCollection = null;
      
      if (retries === 1) {
        throw new Error('Failed to ensure MongoDB connection after retries');
      }
      retries--;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between retries
    }
  }
  return false;
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
    
    // Log if ships data is included
    if (user.ships) {
      console.log('MongoDB: Updating ships data for user', id, user.ships.length);
    }
    
    const updatedUser = { 
      ...existingUser, 
      ...user, 
      updatedAt: new Date().toISOString() 
    };
    
    // Explicitly ensure ships are set if provided
    if (user.ships) {
      updatedUser.ships = user.ships;
    }
    
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

// Password Reset Token Functions

// Create a reset token
export async function createResetToken(token: PasswordResetToken): Promise<PasswordResetToken> {
  try {
    await ensureConnection();
    
    await resetTokenCollection!.insertOne(token);
    console.log('Reset token created successfully:', token.id);
    return token;
  } catch (error: any) {
    console.error('Error creating reset token:', error);
    throw new Error(`Failed to create reset token: ${error.message || 'Unknown error'}`);
  }
}

// Get a token by its token string
export async function getResetTokenByToken(tokenString: string): Promise<PasswordResetToken | null> {
  try {
    await ensureConnection();
    
    const token = await resetTokenCollection!.findOne({ token: tokenString });
    if (!token) return null;
    
    // Remove MongoDB's _id field
    const { _id, ...tokenData } = token;
    return tokenData as PasswordResetToken;
  } catch (error) {
    console.error('Error fetching reset token:', error);
    return null;
  }
}

// Mark a token as used
export async function markResetTokenAsUsed(tokenId: string): Promise<boolean> {
  try {
    await ensureConnection();
    
    const result = await resetTokenCollection!.updateOne(
      { id: tokenId },
      { $set: { used: true } }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error marking reset token as used:', error);
    return false;
  }
}

// Clean up expired tokens
export async function cleanupExpiredTokens(): Promise<void> {
  try {
    await ensureConnection();
    
    const now = new Date().toISOString();
    const result = await resetTokenCollection!.deleteMany({
      $or: [
        { expiresAt: { $lt: now } },
        { used: true }
      ]
    });
    
    console.log(`Cleaned up ${result.deletedCount} expired or used tokens`);
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
} 