# Environment Variables Setup

For the application to work correctly, you need to set up the following environment variables in a `.env.local` file in the root of your project:

```
# NextAuth Secret (used for JWT signing)
NEXTAUTH_SECRET=your_next_auth_secret
NEXTAUTH_URL=http://localhost:3000

# Azure Cosmos DB Configuration
COSMOS_ENDPOINT=your-cosmos-endpoint
COSMOS_KEY=your-cosmos-key
COSMOS_DATABASE_ID=your-database-id
COSMOS_CONTAINER_ID=your-container-id

# Microsoft Entra ID (Azure AD) Configuration
ENTRA_TENANT_ID=your-tenant-id
ENTRA_CLIENT_ID=your-client-id
ENTRA_CLIENT_SECRET=your-client-secret
```

For `NEXTAUTH_SECRET`, you can generate a secure random string using:
```
openssl rand -base64 32
```
Or any other method to create a secure random string.

## Azure Cosmos DB Setup

1. Create an Azure Cosmos DB account (API: Core (SQL))
2. Create a database (e.g., `aydocorp-database`)
3. Create a container in the database (e.g., `users` with partition key `/id`)
4. Copy the endpoint and key from the Azure Portal to your `.env.local` file

## Microsoft Entra ID (Azure AD) Setup

1. Go to the Microsoft Entra ID (Azure AD) admin center
2. Register a new application
3. Set up authentication:
   - Add a web platform
   - Set redirect URI to `http://localhost:3000/api/auth/callback/azure-ad` for local development
   - Add additional redirect URIs for your production environment
4. Add the necessary API permissions:
   - Microsoft Graph: `User.Read`
5. Create a client secret
6. Copy the tenant ID, client ID, and client secret to your `.env.local` file

After creating the `.env.local` file with all required variables, restart your Next.js server for the changes to take effect.

## Migrating Existing Users

If you have existing users in the local JSON file (`data/users.json`), you can migrate them to Azure Cosmos DB using:

```
npm run migrate-users
```

## User Data Storage

This application uses a local JSON file (`data/users.json`) for user authentication. When deploying to production environments, you might want to consider implementing a more robust database solution like Azure SQL Database or Cosmos DB. 