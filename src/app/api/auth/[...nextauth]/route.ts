import NextAuth from "next-auth";
import { authOptions } from "../auth";

// This makes sure NextAuth handles all auth-related routes
const handler = NextAuth(authOptions);

// Export the handler for all HTTP methods that NextAuth might need
export { handler as GET, handler as POST };