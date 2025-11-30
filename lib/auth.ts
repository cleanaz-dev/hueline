// lib/auth.ts
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { getBooking } from "./redis";


// 🔥 you will eventually replace this with getViewer()
// for now just reuse getBooking() so it works without changing anything else.
async function getViewer(id: string) {
  const data = await getBooking(id);
  return data;
}

export const authOptions = {
  providers: [
    // ------------------------------
    // 🔵 ADMIN LOGIN
    // ------------------------------
    CredentialsProvider({
      id: "admin",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        if (
          credentials.email === process.env.ADMIN_EMAIL &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return {
            id: "admin",
            name: "Admin",
            email: credentials.email,
          };
        }

        return null;
      },
    }),

    // ------------------------------
    // 🟢 CUSTOMER LOGIN (PIN)
    // The person who made the booking - full edit access
    // ------------------------------
    CredentialsProvider({
      id: "customer",
      name: "Customer",
      credentials: {
        bookingId: { label: "Booking ID", type: "text" },
        pin: { label: "PIN", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.bookingId || !credentials?.pin) return null;

        const booking = await getBooking(credentials.bookingId);

        if (booking && booking.pin === credentials.pin) {
          return {
            id: credentials.bookingId,
            name: `Customer ${credentials.bookingId}`,
            email: `customer-${credentials.bookingId}@example.com`,
          };
        }

        return null;
      },
    }),

    // ------------------------------
    // 🟣 VIEWER LOGIN (READ-ONLY)
    // Shared access - can view but not edit
    // ------------------------------
    CredentialsProvider({
      id: "viewer",
      name: "Viewer",
      credentials: {
        viewerId: { label: "Viewer ID", type: "text" },
        pin: { label: "PIN", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.viewerId || !credentials?.pin) return null;

        const viewer = await getViewer(credentials.viewerId);

        // viewer.viewerPin is where you store the PIN
        if (viewer && viewer.viewerPin === credentials.pin) {
          return {
            id: `viewer-${credentials.viewerId}`,
            name: `Viewer ${credentials.viewerId}`,
            email: `viewer-${credentials.viewerId}@example.com`,
          };
        }

        return null;
      },
    }),
  ],

  // ------------------------------
  // 🔐 JWT + SESSION
  // ------------------------------
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.provider = account?.provider; // admin | customer | viewer
        token.role = account?.provider;     // same thing, easier to check
      }
      return token;
    },

    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      if (token.provider) session.provider = token.provider as string;
      if (token.role) session.role = token.role as string;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthOptions;