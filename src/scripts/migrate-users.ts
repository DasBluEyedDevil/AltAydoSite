import fs from 'fs';
import path from 'path';
import { CosmosClient } from '@azure/cosmos';
import dotenv from 'dotenv';
import { User } from '@/types/user';

// Load environment variables directly from .env.local file
const envPath = path.resolve(process.cwd(), '.env.local');
console.log(`Loading environment variables from: ${envPath}`);

if (fs.existsSync(envPath)) {
  console.log('.env.local file found.');
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  
  // Apply each environment variable to process.env
  Object.entries(envConfig).forEach(([key, value]) => {
    process.env[key] = value;
  });
} else {
  console.log('.env.local file not found. Please create it with the required variables.');
  process.exit(1);
}

// Azure Cosmos DB Configuration
const endpoint = process.env.COSMOS_ENDPOINT || '';
const key = process.env.COSMOS_KEY || '';
const databaseId = process.env.COSMOS_DATABASE_ID || '';
const containerId = process.env.COSMOS_CONTAINER_ID || '';

// Local storage for users
const dataDir = path.join(process.cwd(), 'data');
const usersFilePath = path.join(dataDir, 'users.json');

// Helper function to read users from local storage
const getLocalUsers = (): User[] => {
  if (!fs.existsSync(dataDir) || !fs.existsSync(usersFilePath)) {
    console.log('No local user data found.');
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

async function migrateUsers() {
  console.log('Starting user migration to Azure Cosmos DB...');
  
  // Validate Azure Cosmos DB configuration
  if (!endpoint || !key || !databaseId || !containerId) {
    console.error('Missing Azure Cosmos DB configuration. Check your environment variables.');
    return;
  }
  
  try {
    // Initialize Cosmos Client
    const client = new CosmosClient({ endpoint, key });
    console.log('Connected to Azure Cosmos DB');
    
    // Get database reference
    const database = client.database(databaseId);
    
    // Get or create container
    const containerExists = await doesContainerExist(database);
    if (!containerExists) {
      console.log(`Container '${containerId}' doesn't exist. Creating it...`);
      await database.containers.createIfNotExists({ id: containerId, partitionKey: { paths: ['/id'] } });
      console.log(`Container '${containerId}' created.`);
    }
    
    const container = database.container(containerId);
    
    // Get local users
    const localUsers = getLocalUsers();
    if (localUsers.length === 0) {
      console.log('No local users to migrate.');
      return;
    }
    
    console.log(`Found ${localUsers.length} local users to migrate.`);
    
    // Migrate each user
    let successCount = 0;
    let errorCount = 0;
    
    for (const user of localUsers) {
      try {
        // Check if user already exists in Cosmos DB
        const querySpec = {
          query: 'SELECT * FROM c WHERE c.id = @id OR c.email = @email OR c.aydoHandle = @aydoHandle',
          parameters: [
            { name: '@id', value: user.id },
            { name: '@email', value: user.email.toLowerCase() },
            { name: '@aydoHandle', value: user.aydoHandle.toLowerCase() }
          ]
        };
        
        const { resources } = await container.items.query(querySpec).fetchAll();
        
        if (resources.length > 0) {
          console.log(`User already exists in Cosmos DB: ${user.aydoHandle} (${user.email})`);
          continue;
        }
        
        // Create user in Cosmos DB
        const { resource } = await container.items.create(user);
        console.log(`Migrated user: ${user.aydoHandle} (${user.email})`);
        successCount++;
      } catch (error) {
        console.error(`Error migrating user ${user.aydoHandle}:`, error);
        errorCount++;
      }
    }
    
    console.log('Migration complete.');
    console.log(`Successfully migrated: ${successCount} users`);
    console.log(`Failed to migrate: ${errorCount} users`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

async function doesContainerExist(database: any) {
  try {
    const { resources } = await database.containers.readAll().fetchAll();
    return resources.some((r: { id: string }) => r.id === containerId);
  } catch (error) {
    console.error('Error checking container existence:', error);
    return false;
  }
}

// Run the migration
migrateUsers().catch(console.error); 