// lib/auth.ts (combined auth)
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { getBooking } from "./redis";

export const authOptions: NextAuthOptions = {
  providers: [
    // Admin credentials provider
    CredentialsProvider({
      id: "admin", // ← Unique ID for admin
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials?: Record<"email" | "password", string>
      ): Promise<{ id: string; name: string; email: string } | null> {
        if (!credentials) return null;

        const { email, password } = credentials;

        if (
          email === process.env.ADMIN_EMAIL &&
          password === process.env.ADMIN_PASSWORD
        ) {
          return { id: "1", name: "Admin", email };
        }

        return null;
      },
    }),
    // Booking credentials provider
    CredentialsProvider({
      id: "booking", // ← Unique ID for booking
      name: "Booking",
      credentials: {
        bookingId: { label: "Booking ID", type: "text" },
        pin: { label: "PIN", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials?.bookingId || !credentials?.pin) return null;

        const booking = await getBooking(credentials.bookingId);
        
        if (booking && booking.pin === credentials.pin) {
          return { 
            id: credentials.bookingId, 
            name: `Booking ${credentials.bookingId}`,
            email: `booking-${credentials.bookingId}@example.com` // dummy email
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id;
        // Store provider to distinguish between admin and booking sessions
        token.provider = account?.provider;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.user.id = token.id;
      session.provider = token.provider; // "admin" or "booking"
      return session;
    },
  },
  pages: {
    signIn: "/login", // Default signin page (for admin)
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};