import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Check if we are in production
const isProd = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  debug: true,
  session: { strategy: "jwt" },

  // --- COOKIE OVERRIDE ---
  cookies: {
    sessionToken: {
      name: isProd
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
        // 🔥 FIX: Set to .lvh.me in dev so cookies work across subdomains
        domain: isProd ? ".hue-line.com" : ".lvh.me",
      },
    },
    csrfToken: {
      name: isProd ? `__Secure-next-auth.csrf-token` : `next-auth.csrf-token`, // Changed!
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
        domain: isProd ? ".hue-line.com" : ".lvh.me",
      },
    },
  },

  providers: [
    CredentialsProvider({
      id: "saas-account",
      name: "Partner Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.subdomainUser.findFirst({
          where: { email: credentials.email },
          include: { subdomain: true },
        });
        if (!user || !user.passwordHash) return null;
        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );
        if (!isValid) return null;
        return {
          id: user.id,
          name: user.name || user.email.split("@")[0],
          email: user.email,
          role: user.role,
          subdomainSlug: user.subdomain?.slug,
        };
      },
    }),
   CredentialsProvider({
      id: "booking-portal",
      name: "Booking Access",
      credentials: {
        huelineId: { label: "Hueline ID", type: "text" },
        pin: { label: "PIN", type: "text" },
      },
      async authorize(credentials) {
        const dbBooking = await prisma.subBookingData.findFirst({
          where: {
            huelineId: { equals: credentials?.huelineId, mode: "insensitive" },
          },
          // Make sure we have the customer data if needed, 
          // though customerId is likely a direct field on subBookingData
          include: { subdomain: true }, 
        });

        if (!dbBooking || String(dbBooking.pin) !== String(credentials?.pin))
          return null;

        return {
          // Fallback to huelineId if customerId doesn't exist yet for older records
          id: dbBooking.customerId || dbBooking.huelineId, 
          role: "customer",
          subdomainSlug: dbBooking.subdomain?.slug,
          huelineId: dbBooking.huelineId, 
          customerId: dbBooking.customerId, // 🔥 ADD THIS: Pass customerId
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.subdomainSlug = (user as any).subdomainSlug;
        token.huelineId = (user as any).huelineId;
        token.customerId = (user as any).customerId; // 🔥 Pass to token
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.role = token.role as string;
        session.user.subdomainSlug = token.subdomainSlug as string;

        (session.user as any).huelineId = token.huelineId as string;
        (session.user as any).customerId = token.customerId as string; // 🔥 Pass to session
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
