import * as mongoDb from './mongodb-client';

// Flag to track connection status
let mongoDbConnectionAttempted = false;
let mongoDbConnectionFailed = false;

/**
 * Checks if MongoDB should be used or if we should fall back to local storage.
 * 
 * This function attempts to connect to MongoDB if no connection has been tried yet.
 * If the connection fails, it remembers that and returns false for future calls.
 */
export async function shouldUseMongoDb(): Promise<boolean> {
  // If we've already tried and failed, don't try again
  if (mongoDbConnectionFailed) {
    console.log('STORAGE: Using local storage because previous MongoDB connection failed');
    return false;
  }
  
  // If we haven't tried connecting to MongoDB yet, try now
  if (!mongoDbConnectionAttempted) {
    console.log('STORAGE: Testing MongoDB connection');
    mongoDbConnectionAttempted = true;
    
    try {
      const connected = await mongoDb.connect();
      if (!connected) {
        console.log('STORAGE: MongoDB connection test failed, using local storage');
        mongoDbConnectionFailed = true;
        return false;
      }
      
      console.log('STORAGE: MongoDB connection test successful');
      return true;
    } catch (error) {
      console.error('STORAGE: Error testing MongoDB connection:', error);
      mongoDbConnectionFailed = true;
      return false;
    }
  }
  
  // If we've tried and not failed, then MongoDB is available
  return !mongoDbConnectionFailed;
} 