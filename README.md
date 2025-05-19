# AydoCorp Website

This project is a Next.js application that uses NextAuth.js for authentication and Microsoft Azure for database storage and authentication.

## Architecture Overview

- **Frontend**: Next.js 15.3.2 with React 18
- **Authentication**: NextAuth.js with Microsoft Entra ID (Azure AD)
- **Database**: Azure Cosmos DB with local file storage fallback
- **Hosting**: Deploy to your preferred platform (Vercel, Azure, custom server, etc.)

## Hybrid Storage System

This application uses a hybrid storage approach:

1. **Primary**: Azure Cosmos DB for cloud-based persistent storage
2. **Fallback**: Local JSON file storage if Azure Cosmos DB is unavailable

The system automatically tries to connect to Azure Cosmos DB first. If the connection fails, it seamlessly falls back to local file storage without requiring any code changes or configuration updates.

### Storage Status

You can check the current storage status by accessing the `/api/storage-status` endpoint, which will tell you whether the system is using Azure Cosmos DB or the local file storage fallback.

## Setup Instructions

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- Microsoft Azure account with:
  - Azure Cosmos DB account
  - Microsoft Entra ID (Azure AD) application

### Local Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd dasblueeyeddevil.github.io
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   # NextAuth.js Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   
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

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Migrating Users from Local Storage to Azure Cosmos DB

If you have existing user data in local storage, you can migrate it to Azure Cosmos DB using the provided migration script:

```bash
npm run migrate-users
```

This script will:
1. Read users from the local `data/users.json` file
2. Check if they already exist in Cosmos DB
3. Create new user records in Cosmos DB for users that don't exist

### Azure Setup

#### Azure Cosmos DB Setup

1. Create an Azure Cosmos DB account (API: Core (SQL))
2. Create a database (e.g., `aydocorp-database`)
3. Create a container in the database (e.g., `users` with partition key `/id`)
4. Get the endpoint and key from the Azure Portal
5. Add these values to your `.env.local` file

#### Microsoft Entra ID (Azure AD) Setup

1. Go to the Microsoft Entra ID (Azure AD) admin center
2. Register a new application
3. Set up authentication:
   - Add a web platform
   - Set redirect URI to `http://localhost:3000/api/auth/callback/azure-ad` for local development
   - Add additional redirect URIs for your production environment
4. Add the necessary API permissions:
   - Microsoft Graph: `User.Read`
5. Create a client secret
6. Add the tenant ID, client ID, and client secret to your `.env.local` file

### Deployment

1. Push your code to your Git repository.
2. Deploy to your preferred platform (e.g., Vercel, Azure, or your own server).
3. Set the environment variables in your deployment platform to match your production settings.
4. Update the redirect URIs in your Microsoft Entra ID application to include your production callback URL.

## Authentication Flow

This project supports two authentication methods:

1. **Traditional Credentials**:
   - Users log in with their AydoCorp handle and password
   - Authentication happens against Azure Cosmos DB

2. **Microsoft Entra ID (Azure AD)**:
   - Users click "Sign in with Microsoft"
   - They're redirected to Microsoft login
   - After successful authentication, users are redirected back to the application
   - New users are automatically created with default permissions

## Project Structure

- `/src/app`: Next.js App Router pages and API routes
- `/src/components`: React components
- `/src/lib`: Utility libraries, including Azure integration
- `/src/utils`: Utility functions
- `/public`: Static assets
- `/src/scripts`: Administrative scripts like the user migration tool

## Important Notes

- Azure Cosmos DB is used as the primary user data storage
- Local file storage is used as an automatic fallback if Cosmos DB is unavailable
- Microsoft Entra ID (Azure AD) provides an alternative login method
- Environment variables are crucial for the application to work correctly
- For local development, set the correct values in your `.env.local` file
