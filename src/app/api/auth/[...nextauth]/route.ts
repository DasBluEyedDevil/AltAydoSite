import NextAuth from 'next-auth/next';
import { authOptions } from '../auth';

// Note: Type declarations are now imported from auth.ts

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
