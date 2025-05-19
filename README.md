# AydoCorp Website

This project is a Next.js application that uses NextAuth.js for authentication and local file storage for user data. It is no longer dependent on AWS, Amplify, DynamoDB, or any cloud database/hosting provider.

## Architecture Overview

- **Frontend**: Next.js 15.3.2 with React 18
- **Authentication**: NextAuth.js
- **Database**: Local file storage (no cloud database)
- **Hosting**: Deploy to your preferred platform (Vercel, Azure, custom server, etc.)

## Setup Instructions

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later

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
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deployment

1. Push your code to your Git repository.
2. Deploy to your preferred platform (e.g., Vercel, Azure, or your own server).
3. Set the following environment variables in your deployment platform:
   - `NEXTAUTH_SECRET`: A secure random string for NextAuth.js
   - `NEXTAUTH_URL`: Your production URL (e.g., https://aydocorp.space)

## Authentication Flow

This project uses NextAuth.js for authentication. The authentication flow works as follows:

1. Users log in through the `/login` page using their AydoCorp credentials.
2. NextAuth.js authenticates the user against local file storage.
3. After successful authentication, NextAuth.js creates a JWT session.
4. Protected routes are guarded by the middleware, which checks for a valid session.

## Project Structure

- `/src/app`: Next.js App Router pages and API routes
- `/src/components`: React components
- `/src/utils`: Utility functions
- `/public`: Static assets

## Important Notes

- This project uses NextAuth.js for authentication and local file storage for user data.
- There are no cloud database or hosting dependencies.
- Environment variables are crucial for the application to work correctly.
- For local development, set the correct values in your `.env.local` file.
