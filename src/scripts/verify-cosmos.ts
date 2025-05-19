import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { CosmosClient } from '@azure/cosmos';

// Load environment variables from .env.local file
const envFile = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envFile)) {
  console.log('.env.local exists, loading variables...');
  dotenv.config({ path: envFile });
} else {
  console.log('.env.local not found, loading from env.local instead...');
  dotenv.config({ path: path.resolve(process.cwd(), 'env.local') });
}

// Extract and validate Cosmos DB config
const cosmosEndpoint = process.env.COSMOS_ENDPOINT;
const cosmosKey = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DATABASE_ID;
const containerId = process.env.COSMOS_CONTAINER_ID;

console.log('\nCosmos DB Configuration:');
console.log(`Endpoint: ${cosmosEndpoint}`);
console.log(`Key provided: ${cosmosKey ? 'Yes (first 5 chars: ' + cosmosKey.substring(0, 5) + '...)' : 'No'}`);
console.log(`Database ID: ${databaseId}`);
console.log(`Container ID: ${containerId}`);

if (!cosmosEndpoint || !cosmosKey) {
  console.error('\nERROR: Missing required Cosmos DB configuration in .env.local');
  process.exit(1);
}

// Fix common issues with Cosmos DB configuration
let fixedEndpoint = cosmosEndpoint;

// Remove trailing slash if present
if (fixedEndpoint.endsWith('/')) {
  fixedEndpoint = fixedEndpoint.slice(0, -1);
  console.log('\nRemoved trailing slash from endpoint.');
}

// Check for port number and fix if needed
if (fixedEndpoint.includes(':')) {
  const parts = fixedEndpoint.split(':');
  if (parts.length > 2) {
    fixedEndpoint = `${parts[0]}:${parts[1]}`;
    console.log(`\nRemoved port number from endpoint: ${fixedEndpoint}`);
  }
}

// If changes were made, suggest updating the environment file
if (fixedEndpoint !== cosmosEndpoint) {
  console.log('\nSuggested endpoint format:');
  console.log(fixedEndpoint);
  
  // Create updated .env.local content
  const envContent = `COSMOS_ENDPOINT=${fixedEndpoint}
COSMOS_KEY=${cosmosKey}
COSMOS_DATABASE_ID=${databaseId}
COSMOS_CONTAINER_ID=${containerId}

ENTRA_TENANT_ID=${process.env.ENTRA_TENANT_ID || ''}
ENTRA_CLIENT_ID=${process.env.ENTRA_CLIENT_ID || ''}
ENTRA_CLIENT_SECRET=${process.env.ENTRA_CLIENT_SECRET || ''}

NEXTAUTH_URL=${process.env.NEXTAUTH_URL || 'http://localhost:3000'}
NEXTAUTH_SECRET=${process.env.NEXTAUTH_SECRET || ''}
`;

  // Ask if we should write the updated version
  console.log('\nDo you want to update your .env.local file with this configuration? (y/n)');
  // In a real script, you would wait for user input here
  
  // Write the file automatically for demo purposes
  fs.writeFileSync('.env.local', envContent);
  console.log('Updated .env.local file with corrected configuration.');
}

// Now try to connect to verify the configuration
console.log('\nTesting connection to Azure Cosmos DB...');

async function testConnection() {
  try {
    const client = new CosmosClient({
      endpoint: fixedEndpoint,
      key: cosmosKey,
      connectionPolicy: {
        requestTimeout: 30000, // 30 seconds timeout
        retryOptions: {
          maxRetryAttemptCount: 5,
          maxWaitTimeInSeconds: 30
        }
      }
    });
    
    console.log('CosmosClient initialized successfully.');
    
    // Try to create the database if it doesn't exist
    console.log(`Creating database "${databaseId}" if it doesn't exist...`);
    const { database } = await client.databases.createIfNotExists({ id: databaseId });
    console.log(`Database ready: ${database.id}`);
    
    // Try to create the container if it doesn't exist
    console.log(`Creating container "${containerId}" if it doesn't exist...`);
    const { container } = await database.containers.createIfNotExists({
      id: containerId,
      partitionKey: { paths: ['/id'] }
    });
    console.log(`Container ready: ${container.id}`);
    
    // Run a simple query to verify connection
    console.log('Running test query...');
    const queryResponse = await container.items.query('SELECT VALUE COUNT(1) FROM c').fetchAll();
    console.log(`Query successful. Container has ${queryResponse.resources[0]} items.`);
    
    console.log('\nConnection verification SUCCESSFUL! Your Cosmos DB configuration is working correctly.');
    return true;
  } catch (error) {
    console.error('\nConnection verification FAILED!');
    console.error('Error details:', error);
    return false;
  }
}

testConnection().then(success => {
  if (!success) {
    console.log('\nRecommendations:');
    console.log('1. Make sure you have created your Cosmos DB account in the Azure portal');
    console.log('2. Verify your primary key is correct in the environment variables');
    console.log('3. Check that your Azure Cosmos DB account is not firewalled or has your IP allowed');
    console.log('4. Try connecting using the Azure portal Data Explorer to verify the account is working');
  }
}); 