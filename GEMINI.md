# Gemini Agent Instructions

This document provides instructions for the Gemini agent to interact with the AydoCorp website project.

## Project Overview

This is a Next.js application for the AydoCorp website. It uses NextAuth.js for authentication, with Microsoft Entra ID (Azure AD) as an option, and Azure Cosmos DB for the database with a local JSON file fallback.

## Getting Started

To set up the local development environment:

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

## Development Scripts

Here are the most common scripts to use during development:

*   `npm run dev`: Starts the development server.
*   `npm run build`: Creates a production build of the application.
*   `npm run start`: Starts the production server.
*   `npm run lint`: Lints the code using ESLint to check for code quality and style issues.
*   `npm run type-check`: Runs the TypeScript compiler to check for type errors.

## Code Style and Conventions

*   This project uses ESLint for code style. Run `npm run lint` to check for issues.
*   The project uses TypeScript. Run `npm run type-check` to check for type errors.
*   Follow the existing code style and conventions in the project.

## Testing

There are no dedicated testing scripts like `npm test` with a test runner like Jest or Vitest. However, there are several scripts for testing specific parts of the application:

*   `npm run test-cosmos`: Tests the connection to Azure Cosmos DB.
*   `npm run test-mongo`: Tests the connection to MongoDB.
*   `npm run verify-cosmos`: Verifies the Azure Cosmos DB setup.
*   `npm run verify-email`: Verifies the email configuration.

Before making changes, it's a good practice to run `npm run lint` and `npm run type-check` to ensure the code is clean and type-safe.

## Deployment

The project is deployed using GitHub Actions, as seen in the `.github/workflows` directory. The workflows handle deployment to Azure.
