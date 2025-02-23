import NextAuth, { NextAuthOptions, Session, SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("User not found");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Incorrect password");
        }

        return {
          id: user.id.toString(), // Cast the id to a string
          email: user.email || "", // Ensure email is a string
        };
      },
    }),
  ],
  pages: {
    signIn: "/", // Customize your login page if needed
  },
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  secret: process.env.NEXTAUTH_SECRET, // Ensure this is set in `.env`
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Store user ID in the token
        token.email = user.email ?? ""; // Ensure email is always a string
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string, // Ensure ID is string
          email: token.email as string,
        };
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
