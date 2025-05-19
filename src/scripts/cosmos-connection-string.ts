import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from env.local
function loadEnvFile() {
  try {
    const envPath = path.join(process.cwd(), 'env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const envVars = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      
      const env: Record<string, string> = {};
      for (const envVar of envVars) {
        const [key, ...valueParts] = envVar.split('=');
        if (key) {
          const value = valueParts.join('=').trim();
          env[key.trim()] = value;
        }
      }
      return env;
    }
    return null;
  } catch (error) {
    console.error('Error loading env file:', error);
    return null;
  }
}

function buildConnectionString() {
  const env = loadEnvFile();
  if (!env) {
    console.error('Failed to load env file');
    return null;
  }
  
  const endpoint = env.COSMOS_ENDPOINT;
  const key = env.COSMOS_KEY;
  const databaseId = env.COSMOS_DATABASE_ID;
  
  if (!endpoint || !key || !databaseId) {
    console.error('Missing required environment variables');
    console.log('COSMOS_ENDPOINT:', endpoint ? '✓' : '✗');
    console.log('COSMOS_KEY:', key ? '✓' : '✗');
    console.log('COSMOS_DATABASE_ID:', databaseId ? '✓' : '✗');
    return null;
  }
  
  // Parse server name from endpoint
  const serverName = endpoint.replace('https://', '').split('.')[0];
  console.log('Server name:', serverName);
  
  // Build connection string
  const password = encodeURIComponent(key);
  const host = endpoint.replace('https://', '');
  
  const connectionString = `mongodb://${serverName}:${password}@${host}:10255/${databaseId}?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000`;
  
  return connectionString;
}

// Main function
function main() {
  console.log('Generating MongoDB connection string for Azure Cosmos DB...');
  const connectionString = buildConnectionString();
  
  if (connectionString) {
    console.log('\nConnection string generated successfully!\n');
    console.log('Add the following to your .env.local file:');
    console.log('MONGODB_URI=' + connectionString);
    
    // Attempt to write to a new file to avoid modifying existing files
    try {
      fs.writeFileSync('mongodb-connection.txt', 'MONGODB_URI=' + connectionString);
      console.log('\nConnection string also saved to mongodb-connection.txt');
    } catch (error) {
      console.error('Error writing connection string to file:', error);
    }
  } else {
    console.log('Failed to generate connection string');
  }
}

main(); 