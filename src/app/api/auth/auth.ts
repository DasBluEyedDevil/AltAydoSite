import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { User } from '@/types/user';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';

// Set up Amplify client
let amplifyAvailable = false;
let amplifyClient: any = null;

try {
  // Get configuration values
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
  const apiKey = process.env.NEXT_PUBLIC_GRAPHQL_API_KEY;
  const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';

  if (!endpoint || !apiKey) {
    console.warn("Auth: Missing GraphQL endpoint or API key. Amplify authentication will fall back to alternative methods.");
    console.warn("Please set NEXT_PUBLIC_GRAPHQL_ENDPOINT and NEXT_PUBLIC_GRAPHQL_API_KEY in your environment.");
    amplifyAvailable = false;
  } else {
    // Configure Amplify if running server-side
    Amplify.configure({
      // Configuration will be loaded from amplify_outputs.json or environment variables
      API: {
        GraphQL: {
          endpoint: endpoint,
          apiKey: apiKey,
          region: region,
          defaultAuthMode: 'apiKey',
        },
      },
    });

    // Generate client for server-side operations
    amplifyClient = generateClient();
    amplifyAvailable = true;
    console.log('Amplify client configured successfully for auth');
  }
} catch (error) {
  console.error('Error configuring Amplify client for auth:', error);
  amplifyAvailable = false;
}

// Set up DynamoDB client (will be used if Amplify is not available)
let dynamoDbAvailable = false;
let docClient: any = null;

try {
  const client = new DynamoDBClient({
    region: 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });

  docClient = DynamoDBDocumentClient.from(client);
  dynamoDbAvailable = true;
} catch (error) {
  console.error('Error setting up DynamoDB client:', error);
  dynamoDbAvailable = false;
}

// DynamoDB table name for users
const USERS_TABLE = 'AydoUsers';

// Local storage for users
const dataDir = path.join(process.cwd(), 'data');
const usersFilePath = path.join(dataDir, 'users.json');

// Helper function to read users from local storage
const getLocalUsers = (): User[] => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([]), 'utf8');
    return [];
  }

  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data) as User[];
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
};

// Admin user for fallback
const adminUser: User = {
  id: '1',
  aydoHandle: 'admin',
  email: 'admin@aydocorp.com',
  passwordHash: '$2b$10$8OxDFt.GT.LV4xmX9ATR8.w4kGhJZgXnqnZqf5wn3EHQ8GqOAFMaK', // "password123"
  clearanceLevel: 5,
  role: 'admin',
  discordName: 'admin#1234',
  rsiAccountName: 'admin_rsi'
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'AydoCorp Credentials',
      credentials: {
        aydoHandle: { label: 'AydoCorp Handle', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.aydoHandle || !credentials?.password) {
          return null;
        }

        try {
          // Admin user special case - always allow admin login
          if (credentials.aydoHandle.toLowerCase() === 'admin') {
            console.log('Admin login attempt');
            const isPasswordValid = await bcrypt.compare(credentials.password, adminUser.passwordHash);

            if (!isPasswordValid) {
              console.log('Invalid admin password');
              return null;
            }

            console.log('Admin authentication successful');
            return {
              id: adminUser.id,
              name: adminUser.aydoHandle,
              email: adminUser.email,
              clearanceLevel: adminUser.clearanceLevel,
              role: adminUser.role,
              aydoHandle: adminUser.aydoHandle,
              discordName: adminUser.discordName || null,
              rsiAccountName: adminUser.rsiAccountName || null
            };
          }

          let user: User | null = null;

          // First, try to find user in Amplify (new primary source)
          if (amplifyAvailable && amplifyClient) {
            try {
              console.log(`Looking for user with handle in Amplify: ${credentials.aydoHandle}`);
              const response = await amplifyClient.models.User.list({
                filter: { aydoHandle: { eq: credentials.aydoHandle } }
              });

              if (response.data && response.data.length > 0) {
                // Convert Amplify user to our User type
                const amplifyUser = response.data[0];
                user = {
                  id: amplifyUser.id,
                  aydoHandle: amplifyUser.aydoHandle,
                  email: amplifyUser.email,
                  passwordHash: amplifyUser.passwordHash,
                  clearanceLevel: amplifyUser.clearanceLevel,
                  role: amplifyUser.role,
                  discordName: amplifyUser.discordName || null,
                  rsiAccountName: amplifyUser.rsiAccountName || null
                };
                console.log(`User found in Amplify: ${user.aydoHandle}`);
              }
            } catch (amplifyError) {
              console.error('Error querying Amplify for user:', amplifyError);
              // Continue to next data source
            }
          }

          // If not found in Amplify, try DynamoDB (secondary source)
          if (!user && dynamoDbAvailable && docClient) {
            try {
              console.log(`Looking for user with handle in DynamoDB: ${credentials.aydoHandle}`);
              // Query for user by aydoHandle
              const params = {
                TableName: USERS_TABLE,
                IndexName: 'AydoHandleIndex', 
                KeyConditionExpression: 'aydoHandle = :aydoHandle',
                ExpressionAttributeValues: {
                  ':aydoHandle': credentials.aydoHandle
                }
              };

              const response = await docClient.send(new QueryCommand(params));

              if (response.Items && response.Items.length > 0) {
                user = response.Items[0] as User;
                console.log(`User found in DynamoDB: ${user.aydoHandle}`);
              }
            } catch (dbError) {
              console.error('Error querying DynamoDB for user:', dbError);
              // Continue to next data source
            }
          }

          // If still not found, try local storage (fallback)
          if (!user) {
            console.log(`Looking for user with handle in local storage: ${credentials.aydoHandle}`);
            const localUsers = getLocalUsers();
            const localUser = localUsers.find(u => 
              u.aydoHandle.toLowerCase() === credentials.aydoHandle.toLowerCase()
            );

            if (localUser) {
              user = localUser;
              console.log(`User found in local storage: ${user.aydoHandle}`);
            }
          }

          if (!user) {
            console.log(`No user found with handle: ${credentials.aydoHandle}`);
            return null;
          }

          // Ensure the user has a passwordHash
          if (!user.passwordHash) {
            console.error('User missing passwordHash:', user.aydoHandle);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

          if (!isPasswordValid) {
            console.log(`Invalid password for user: ${user.aydoHandle}`);
            return null;
          }

          console.log(`Authentication successful for: ${user.aydoHandle}`);
          return {
            id: user.id,
            name: user.aydoHandle,
            email: user.email,
            clearanceLevel: user.clearanceLevel,
            role: user.role,
            aydoHandle: user.aydoHandle,
            discordName: user.discordName || null,
            rsiAccountName: user.rsiAccountName || null
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error('Authentication error');
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          id: user.id,
          clearanceLevel: user.clearanceLevel,
          role: user.role,
          aydoHandle: user.aydoHandle,
          discordName: user.discordName,
          rsiAccountName: user.rsiAccountName
        };
      }

      // Return previous token if the access token has not expired
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.clearanceLevel = token.clearanceLevel as number;
        session.user.role = token.role as string;
        session.user.aydoHandle = token.aydoHandle as string;
        session.user.discordName = token.discordName as string | null;
        session.user.rsiAccountName = token.rsiAccountName as string | null;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

export default authOptions;
