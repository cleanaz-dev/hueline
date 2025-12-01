// lib/auth.ts
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { getBooking } from "./redis";

type SharedAccess = {
  email: string;
  accessType: "viewer" | "customer";
  pin: string;
  createdAt: string;
  updatedAt?: string;
};

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
            role: "admin",
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
        if (!booking) return null;

        // Check if PIN matches the main booking PIN (original customer)
        if (booking.pin === credentials.pin) {
          return {
            id: credentials.bookingId,
            name: booking.name || `Customer ${credentials.bookingId}`,
            role: "customer", // Original customer = full access
          };
        }

        // Check if PIN matches any shared access PIN
        if (booking.sharedAccess) {
          const access = booking.sharedAccess.find(
            (sa: SharedAccess) => sa.pin === credentials.pin
          );

          if (access) {
            return {
              id: credentials.bookingId,
              name: access.email.split("@")[0], // Just username part
              role: access.accessType, // "customer" or "viewer"
            };
          }
        }

        return null;
      },
    }),
    CredentialsProvider({
      id: "viewer",
      name: "Viewer",
      credentials: {
        bookingId: { label: "Booking ID", type: "text" },
        pin: { label: "PIN", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.bookingId || !credentials?.pin) return null;

        const booking = await getBooking(credentials.bookingId);
        if (!booking) return null;

        // Check if PIN matches the main booking PIN (original customer)
        if (booking.pin === credentials.pin) {
          return {
            id: credentials.bookingId,
            name: booking.name || `Customer ${credentials.bookingId}`,
            role: "customer", // Original customer = full access
          };
        }

        // Check if PIN matches any shared access PIN
        if (booking.sharedAccess) {
          const access = booking.sharedAccess.find(
            (sa: SharedAccess) => sa.pin === credentials.pin
          );

          if (access) {
            return {
              id: credentials.bookingId,
              name: access.email.split("@")[0], // Just username part
              role: access.accessType, // "customer" or "viewer"
            };
          }
        }

        return null;
      },
    }),
  ],

  // ------------------------------
  // 🔐 JWT + SESSION
  // ------------------------------
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role; // Use the role from authorize()
      }
      return token;
    },

    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
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
