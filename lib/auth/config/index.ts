import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, DefaultSession } from "next-auth"; // Ensure DefaultSession is imported
import { getBooking } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// ⚠️ COOKIE CONFIG NOTE:
// 'localhost' as a domain is often invalid in browsers. 
// We use undefined for dev, which means cookies are host-only.
// In Prod, we use the dot prefix (.hue-line.com) to share across subdomains.
const cookieDomain = process.env.NODE_ENV === 'production' 
  ? '.hue-line.com' 
  : undefined; 

export const authOptions: NextAuthOptions = {
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: cookieDomain
      }
    }
  },

  providers: [
    // --- PROVIDER A: SAAS ACCOUNT ---
    CredentialsProvider({
      id: "saas-account",
      name: "Partner Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.subdomainUser.findUnique({
          where: { email: credentials.email },
          include: { subdomain: true } 
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
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

    // --- PROVIDER B: BOOKING PORTAL ---
    CredentialsProvider({
      id: "booking-portal",
      name: "Booking Access",
      credentials: {
        bookingId: { label: "Booking ID", type: "text" }, // We call it bookingId in the form
        pin: { label: "PIN", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.bookingId || !credentials?.pin) return null;

        let bookingData: any = null;
        let subdomainSlug: string | undefined = undefined;

        // 🟢 1. Redis Check
        // The input 'credentials.bookingId' contains the 'huelineId' string
        const redisData = await getBooking(credentials.bookingId);
        
        if (redisData) {
          // 🛠️ FIX: Normalize the Redis data keys to match what we expect later
          // Python sends 'hueline_id', but we use 'booking_id' internally in the return object
          bookingData = {
            ...redisData,
            booking_id: redisData.hueline_id || redisData.booking_id, // Handle both snake_case and potential legacy keys
          };
          
          if (redisData.subdomain_id) {
             const subdomain = await prisma.subdomain.findUnique({
                where: { id: redisData.subdomain_id },
                select: { slug: true }
             });
             subdomainSlug = subdomain?.slug;
          }
        } 
        
        // 🟠 2. Database Fallback
        if (!bookingData) {
          const dbBooking = await prisma.subBookingData.findUnique({
            where: { huelineId: credentials.bookingId }, // Query by huelineId
            include: { subdomain: true, sharedAccess: true }
          });

          if (dbBooking) {
            // 🛠️ FIX: Map DB 'huelineId' to 'booking_id' for consistency
            bookingData = { 
              ...dbBooking, 
              booking_id: dbBooking.huelineId 
            };
            subdomainSlug = dbBooking.subdomain?.slug;
          }
        }

        if (!bookingData) return null;

        // 🔵 3. Verify PIN
        // (Ensure we compare strings to avoid type mismatches)
        if (String(bookingData.pin) === String(credentials.pin)) {
          return {
            id: bookingData.booking_id,
            name: bookingData.name || "Guest",
            role: "customer",
            accessLevel: "owner",
            bookingId: bookingData.booking_id,
            subdomainSlug: subdomainSlug || "app",
          };
        }

        // Shared Access check
        if (bookingData.sharedAccess && Array.isArray(bookingData.sharedAccess)) {
          const sharedUser = bookingData.sharedAccess.find(
            (u: any) => String(u.pin) === String(credentials.pin)
          );

          if (sharedUser) {
            return {
              id: `${bookingData.booking_id}-${sharedUser.email}`, 
              name: sharedUser.email.split("@")[0],
              role: "customer",
              accessLevel: sharedUser.accessType || "viewer",
              bookingId: bookingData.booking_id,
              subdomainSlug: subdomainSlug || "app",
            };
          }
        }

        return null;
      },
    }),
  ],

  // ... Callbacks and Pages remain the same
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.subdomainSlug = user.subdomainSlug;
        token.bookingId = user.bookingId;
        token.accessLevel = user.accessLevel;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.role = token.role as string;
        session.user.subdomainSlug = token.subdomainSlug as string;
        session.user.bookingId = token.bookingId as string;
        session.user.accessLevel = token.accessLevel as string;
      }
      return session;
    },
  },

  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};