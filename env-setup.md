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

# Email Configuration (for password reset)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
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

## Email Configuration for Password Reset

For the password reset functionality to work, you need to set up an email service. You have several options:

### Option 1: Use Azure Communication Services Email

1. Create an Azure Communication Services resource
2. Add Email service to your resource
3. Create a domain and verify it
4. Create an email address to use for sending emails
5. Get your connection string or managed identity credentials
6. Configure the email environment variables:
   - `EMAIL_HOST`: Use `smtp.azurecomm.net`
   - `EMAIL_PORT`: Use `587`
   - `EMAIL_SECURE`: Set to `false`
   - `EMAIL_USER`: Your Azure Communication Services email address
   - `EMAIL_PASSWORD`: Your Azure Communication Services email password or access key

### Option 2: Use Microsoft 365 / Office 365

1. Use your existing Microsoft 365 account or create a new one
2. Enable SMTP AUTH for your account in the Microsoft 365 admin center
3. Configure the email environment variables:
   - `EMAIL_HOST`: Use `smtp.office365.com`
   - `EMAIL_PORT`: Use `587`
   - `EMAIL_SECURE`: Set to `false`
   - `EMAIL_USER`: Your Microsoft 365 email address
   - `EMAIL_PASSWORD`: Your Microsoft 365 password or app password

### Option 3: Use Gmail

1. Use your existing Gmail account or create a new one
2. Enable "Less secure app access" or create an app password
3. Configure the email environment variables:
   - `EMAIL_HOST`: Use `smtp.gmail.com`
   - `EMAIL_PORT`: Use `587`
   - `EMAIL_SECURE`: Set to `false`
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_PASSWORD`: Your Gmail password or app password

After creating the `.env.local` file with all required variables, restart your Next.js server for the changes to take effect.

## Migrating Existing Users

If you have existing users in the local JSON file (`data/users.json`), you can migrate them to Azure Cosmos DB using:

```
npm run migrate-users
```

## User Data Storage

This application uses a local JSON file (`data/users.json`) for user authentication. When deploying to production environments, you might want to consider implementing a more robust database solution like Azure SQL Database or Cosmos DB. 