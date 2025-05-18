# AydoCorp Website

This project is a Next.js application that uses NextAuth for authentication and AWS Amplify for hosting and database functionality.

## Architecture Overview

- **Frontend**: Next.js 15.3.2 with React 18
- **Authentication**: NextAuth.js (not Amplify Auth)
- **Database**: AWS Amplify Data (GraphQL API)
- **Hosting**: AWS Amplify

## Setup Instructions

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later
- AWS account with Amplify CLI access

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

3. Generate the Amplify backend resources:
   ```bash
   npx ampx generate outputs --app-id "your-app-id" --branch "your-branch"
   ```

4. Create a `.env.local` file with the following variables (copy from `.env` and update with your values):
   ```
   # NextAuth.js Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key

   # Amplify GraphQL API Configuration
   NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://your-api-id.appsync-api.region.amazonaws.com/graphql
   NEXT_PUBLIC_GRAPHQL_API_KEY=your-api-key-from-amplify-console
   NEXT_PUBLIC_AWS_REGION=us-east-1
   ```

   You can get the GraphQL endpoint and API key from the Amplify console after running `npx ampx generate`.

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deployment to Amplify

1. Push your code to your Git repository.

2. Set up a new Amplify app in the AWS Amplify Console, connecting to your repository.

3. Configure the following environment variables in the Amplify Console:
   - `NEXTAUTH_SECRET`: A secure random string for NextAuth.js
   - `NEXTAUTH_URL`: Your production URL (e.g., https://main.d1abc123.amplifyapp.com)
   - `NEXT_PUBLIC_GRAPHQL_ENDPOINT`: Your GraphQL API endpoint
   - `NEXT_PUBLIC_GRAPHQL_API_KEY`: Your GraphQL API key
   - `NEXT_PUBLIC_AWS_REGION`: Your AWS region (e.g., us-east-1)

4. Deploy your application.

## Authentication Flow

This project uses NextAuth.js for authentication instead of Amplify Auth. The authentication flow works as follows:

1. Users log in through the `/login` page using their AydoCorp credentials.
2. NextAuth.js authenticates the user against one of these data sources (in order):
   - Amplify Data (primary source)
   - DynamoDB (secondary source)
   - Local storage (fallback)
3. After successful authentication, NextAuth.js creates a JWT session.
4. Protected routes are guarded by the middleware, which checks for a valid session.

## Project Structure

- `/src/app`: Next.js App Router pages and API routes
- `/src/components`: React components
- `/src/utils/amplify`: Amplify configuration for client, server, and middleware
- `/amplify`: Amplify backend configuration
- `/public`: Static assets

## Important Notes

- This project uses NextAuth.js for authentication instead of Amplify Auth for cost reasons.
- The Amplify backend is used only for data storage and API functionality.
- Environment variables are crucial for the application to work correctly.
- For local development, you need to have the correct GraphQL endpoint and API key in your `.env.local` file.
