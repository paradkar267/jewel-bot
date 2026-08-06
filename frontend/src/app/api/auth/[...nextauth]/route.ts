import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const shop = await prisma.shop.findUnique({
            where: { owner_email: credentials.email },
          });

          if (!shop || !shop.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            shop.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: shop.id,
            name: shop.name,
            email: shop.owner_email,
          };
        } catch (error) {
          console.error("NextAuth authorize DB error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "default_secret_for_development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
