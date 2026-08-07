import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from '@/lib/prisma';

const ADMIN_EMAIL = "bizleap1@gmail.com";

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

          // Support Super Admin One-Click Shop Impersonation bypass
          if (credentials.password === "ADMIN_IMPERSONATE_BYPASS") {
            const shopToImpersonate = await prisma.shop.findFirst({
              where: { owner_email: credentials.email },
            });
            if (shopToImpersonate) {
              return {
                id: shopToImpersonate.id,
                name: shopToImpersonate.name,
                email: shopToImpersonate.owner_email,
                isSuperAdmin: true,
              };
            }
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
            isSuperAdmin: shop.owner_email === ADMIN_EMAIL,
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
        token.isSuperAdmin = (user as any).isSuperAdmin || user.email === ADMIN_EMAIL;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).isSuperAdmin = Boolean(token.isSuperAdmin);
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
