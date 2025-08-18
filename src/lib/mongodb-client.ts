import { MongoClient, Collection, ObjectId } from 'mongodb';
import { ensureMongoIndexes } from '@/lib/mongo-indexes';
import { User } from '@/types/user';
import { PasswordResetToken } from '@/types/password-reset';
import { Transaction } from '@/types/finance';

// MongoDB Configuration
const mongoUri = process.env.MONGODB_URI || process.env.COSMOSDB_CONNECTION_STRING;
const databaseId = process.env.COSMOS_DATABASE_ID || 'aydocorp-database';
const collectionId = process.env.COSMOS_CONTAINER_ID || 'users';
const resetTokensCollectionId = 'resetTokens';
const transactionsCollectionId = 'transactions';

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
let transactionCollection: Collection | null = null;

// Initialize MongoDB connection
export async function connectToDatabase() {
  try {
    if (client) {
      try {
        await client.db().admin().serverInfo();
        return {
          client,
          userCollection: userCollection as Collection,
          resetTokenCollection: resetTokenCollection as Collection,
          transactionCollection: transactionCollection as Collection,
        };
      } catch (e) {
        // Connection is not valid, continue to create new connection
        console.log('Existing connection is not valid, creating new connection');
      }
    }

    if (!mongoUri) {
      throw new Error('MongoDB URI is not defined');
    }

    client = new MongoClient(mongoUri);
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(databaseId);
    // Best-effort index setup
    ensureMongoIndexes(db).catch(() => {});
    userCollection = db.collection(collectionId);
    resetTokenCollection = db.collection(resetTokensCollectionId);
    transactionCollection = db.collection(transactionsCollectionId);

    return {
      client,
      userCollection: userCollection as Collection,
      resetTokenCollection: resetTokenCollection as Collection,
      transactionCollection: transactionCollection as Collection,
    };
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// Helper function to close the database connection
export async function closeDatabaseConnection() {
  if (client) {
    await client.close();
    client = null;
    userCollection = null;
    resetTokenCollection = null;
    transactionCollection = null;
    console.log('Disconnected from MongoDB');
  }
}

// Helper function to ensure connection is ready with retries
export async function ensureConnection(retries = 3): Promise<boolean> {
  while (retries > 0) {
    try {
      if (!client || !userCollection) {
        await connectToDatabase();
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
      transactionCollection = null;
      
      if (retries === 1) {
        throw new Error('Failed to ensure MongoDB connection after retries');
      }
      retries--;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between retries
    }
  }
  return false;
}

// Export collections for use in other files
export { userCollection, resetTokenCollection, transactionCollection };

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
    
    // Prefer normalized lookup when available
    const emailLower = email.toLowerCase();
    const user = await userCollection!.findOne({ 
      $or: [
        { emailLower },
        { email: { $regex: new RegExp(`^${email}$`, 'i') } },
      ],
    }, { projection: { _id: 0 } });
    
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
    
    // Prefer normalized lookup when available
    const aydoHandleLower = aydoHandle.toLowerCase();
    const user = await userCollection!.findOne({ 
      $or: [
        { aydoHandleLower },
        { aydoHandle: { $regex: new RegExp(`^${aydoHandle}$`, 'i') } },
      ],
    }, { projection: { _id: 0 } });
    
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
    
    // Ensure normalized fields
    user.email = user.email.toLowerCase();
    (user as any).emailLower = user.email;
    (user as any).aydoHandleLower = user.aydoHandle.toLowerCase();
    
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
    
    // Log updates for debugging
    if (user.ships) {
      console.log('MongoDB: Updating ships data for user', id, user.ships.length);
    }
    if (user.timezone) {
      console.log('MongoDB: Updating timezone for user', id, 'to:', user.timezone);
    }
    
    const updatedUser = { 
      ...existingUser, 
      ...user, 
      updatedAt: new Date().toISOString() 
    };
    
    // Explicitly ensure special fields are set if provided
    if (user.ships) {
      updatedUser.ships = user.ships;
    }
    if (user.timezone !== undefined) {
      updatedUser.timezone = user.timezone;
    }
    
    console.log('MongoDB: Final update data includes timezone:', !!updatedUser.timezone, updatedUser.timezone);
    
    await userCollection!.updateOne({ id }, { $set: updatedUser });
    
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
    
    const users = await userCollection!.find({}, { projection: { _id: 0 } }).toArray();
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