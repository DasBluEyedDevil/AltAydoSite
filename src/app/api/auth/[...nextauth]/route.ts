import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "AYDO Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "aydo_pilot" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.username === "demo" && credentials?.password === "password") {
          return {
            id: "1",
            name: "Demo User",
            email: "pilot@aydocorp.com",
            role: "pilot",
            image: "/assets/avatar-placeholder.png"
          };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: "c9c3fa66d0c46cfa96ef9b3dfbcb2f30b62cee09f33c9f16a1cc39993a7a1984",
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST }; 