// lib/booking-auth.ts
import CredentialsProvider from "next-auth/providers/credentials";
import { getBooking } from "./redis";

export const bookingAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "booking", // ← Unique ID for booking auth
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
            name: `Booking ${credentials.bookingId}` 
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) token.bookingId = user.id;
      return token;
    },
    async session({ session, token }: any) {
      session.bookingId = token.bookingId;
      return session;
    },
  },
  pages: {
    signIn: "/booking/login",
  },
};