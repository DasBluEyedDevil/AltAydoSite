# Environment Variables Setup

For the application to work correctly, you need to set up the following environment variables in a `.env.local` file in the root of your project:

```
# NextAuth Secret (used for JWT signing)
NEXTAUTH_SECRET=your_next_auth_secret
NEXTAUTH_URL=http://localhost:3000
```

For `NEXTAUTH_SECRET`, you can generate a secure random string using:
```
openssl rand -base64 32
```
Or any other method to create a secure random string.

After creating the `.env.local` file, restart your Next.js server for the changes to take effect. 

## User Data Storage

This application uses a local JSON file (`data/users.json`) for user authentication. When deploying to production environments, you might want to consider implementing a more robust database solution like Azure SQL Database or Cosmos DB. 