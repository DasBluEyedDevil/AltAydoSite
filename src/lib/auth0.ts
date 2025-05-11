import { Auth0Client } from "@auth0/nextjs-auth0/server";

if (!process.env.AUTH0_SECRET) throw new Error('Missing AUTH0_SECRET');
if (!process.env.AUTH0_BASE_URL) throw new Error('Missing AUTH0_BASE_URL');
if (!process.env.AUTH0_ISSUER_BASE_URL) throw new Error('Missing AUTH0_ISSUER_BASE_URL');
if (!process.env.AUTH0_CLIENT_ID) throw new Error('Missing AUTH0_CLIENT_ID');
if (!process.env.AUTH0_CLIENT_SECRET) throw new Error('Missing AUTH0_CLIENT_SECRET');

export const auth0 = new Auth0Client({
  domain: process.env.AUTH0_ISSUER_BASE_URL!.replace('https://', ''),
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  appBaseUrl: process.env.AUTH0_BASE_URL!,
  secret: process.env.AUTH0_SECRET!,
  authorizationParameters: {
    response_type: 'code',
    scope: 'openid profile email',
    audience: process.env.AUTH0_AUDIENCE,
  },
  routes: {
    callback: '/api/auth/callback',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
  },
  session: {
    absoluteDuration: 24 * 60 * 60, // 24 hours
    rolling: true,
  },
  httpTimeout: 5000, // 5 seconds
}); 