import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import * as mongoDb from '../lib/mongodb-client';

// Make sure we load environment variables
import * as path from 'path';
import * as fs from 'fs';

function loadEnvFile() {
  try {
    const envFiles = [
      path.join(process.cwd(), '.env.local'),
      path.join(process.cwd(), 'env.local'),
      path.join(process.cwd(), '.env')
    ];
    
    let loaded = false;
    
    for (const envPath of envFiles) {
      if (fs.existsSync(envPath)) {
        console.log(`Loading variables from ${path.basename(envPath)}`);
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envVars = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        
        for (const envVar of envVars) {
          const [key, ...valueParts] = envVar.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            process.env[key.trim()] = value;
          }
        }
        loaded = true;
      }
    }
    
    if (!loaded) {
      console.log('No env files found');
    }

    // Check for both potential MongoDB connection variables
    console.log(`- MONGODB_URI: ${process.env.MONGODB_URI ? '✓ Set' : '✗ Not set'}`);
    console.log(`- COSMOSDB_CONNECTION_STRING: ${process.env.COSMOSDB_CONNECTION_STRING ? '✓ Set' : '✗ Not set'}`);
    
    return loaded;
  } catch (error) {
    console.error('Error loading env file:', error);
    return false;
  }
}

async function testMongoDBConnection() {
  // Make sure environment variables are loaded
  loadEnvFile();
  
  console.log('Testing MongoDB connection...');
  console.log('Environment variables:');
  console.log(`- COSMOS_ENDPOINT: ${process.env.COSMOS_ENDPOINT ? '✓ Set' : '✗ Not set'}`);
  console.log(`- COSMOS_KEY: ${process.env.COSMOS_KEY ? '✓ Set' : '✗ Not set'}`);
  console.log(`- COSMOS_DATABASE_ID: ${process.env.COSMOS_DATABASE_ID ? '✓ Set' : '✗ Not set'}`);
  console.log(`- COSMOS_CONTAINER_ID: ${process.env.COSMOS_CONTAINER_ID ? `✓ Set (${process.env.COSMOS_CONTAINER_ID})` : '✗ Not set'}`);
  console.log(`- MONGODB_URI: ${process.env.MONGODB_URI ? '✓ Set' : '✗ Not set'}`);
  
  if (process.env.MONGODB_URI) {
    console.log(`MONGODB_URI starts with: ${process.env.MONGODB_URI.substring(0, 20)}...`);
  }
  
  // Manually set the MongoDB URI from the connection string we generated
  if (!process.env.MONGODB_URI && fs.existsSync('mongodb-connection.txt')) {
    const connectionStr = fs.readFileSync('mongodb-connection.txt', 'utf8');
    const [key, value] = connectionStr.split('=');
    if (key === 'MONGODB_URI' && value) {
      process.env.MONGODB_URI = value.trim();
      console.log('Successfully loaded MONGODB_URI from mongodb-connection.txt');
    }
  }
  
  try {
    // Try to connect to MongoDB
    await mongoDb.connect();
    console.log('✅ Successfully connected to MongoDB!');
    
    // Test getting all users
    console.log('Fetching all users...');
    const users = await mongoDb.getAllUsers();
    console.log(`Found ${users.length} users`);
    
    if (users.length > 0) {
      console.log('Sample user data:');
      console.log(JSON.stringify(users[0], null, 2));
    }
    
    // Close the connection
    await mongoDb.close();
    console.log('Connection closed');
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Error testing MongoDB connection:', error);
    process.exit(1);
  }
}

// Run the test
testMongoDBConnection().catch(console.error); 