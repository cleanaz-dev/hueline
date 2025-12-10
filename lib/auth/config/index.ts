import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { getBooking } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  // 1. COOKIE CONFIGURATION (Allows cross-subdomain sessions)
   cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // 👇 CHANGE THIS SECTION
        domain: process.env.NODE_ENV === "production" 
          ? ".hue-line.com" 
          : undefined, // Leave undefined for localhost to support subdomains (demo.localhost) automatically
      },
    },
  },

  providers: [
    // 2. PARTNER/ADMIN LOGIN (Email & Password)
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

    // 3. BOOKING PORTAL ACCESS (ID & PIN)
    CredentialsProvider({
      id: "booking-portal",
      name: "Booking Access",
      credentials: {
        huelineId: { label: "Hueline ID", type: "text" },
        pin: { label: "PIN", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.huelineId || !credentials?.pin) return null;

          let bookingData: any = null;
          let subdomainSlug = "app";

          // A. Try Redis First (Note: Redis keys are usually case-sensitive)
          // If this fails due to casing, it falls through to Step B (Database)
          const redisData = await getBooking(credentials.huelineId);
          
          if (redisData) {
            bookingData = {
              ...redisData,
              booking_id: redisData.hueline_id || redisData.booking_id,
              pin: redisData.pin // Ensure PIN is pulled from Redis
            };
            
            if (redisData.subdomain_id) {
              const subdomain = await prisma.subdomain.findUnique({
                where: { id: redisData.subdomain_id },
                select: { slug: true }
              });
              subdomainSlug = subdomain?.slug || "app";
            }
          } 
          
          // B. Database Fallback (CRITICAL FIX FOR CASE SENSITIVITY)
          if (!bookingData) {
            // 🔥 CHANGED from findUnique to findFirst with insensitive mode
            const dbBooking = await prisma.subBookingData.findFirst({
              where: { 
                huelineId: {
                  equals: credentials.huelineId,
                  mode: "insensitive" // <--- THIS FIXES THE "INCORRECT PIN" ERROR
                }
              },
              include: { subdomain: true, sharedAccess: true }
            });

            if (dbBooking) {
              bookingData = { 
                ...dbBooking, 
                booking_id: dbBooking.huelineId,
                pin: dbBooking.pin
              };
              subdomainSlug = dbBooking.subdomain?.slug || "app";
            }
          }

          if (!bookingData) {
            console.log(`Auth Failed: No booking found for ID ${credentials.huelineId}`);
            return null;
          }

          // C. Verify PIN (Main Owner)
          // Convert both to strings to be safe
          if (String(bookingData.pin).trim() === String(credentials.pin).trim()) {
            return {
              id: bookingData.booking_id,
              name: bookingData.name || "Guest",
              role: "customer",
              accessLevel: "owner",
              huelineId: bookingData.booking_id, // Returns the DB casing (e.g. HL-123)
              subdomainSlug: subdomainSlug,
            };
          }

          // D. Verify Shared Access (Guests/Designers)
          if (bookingData.sharedAccess && Array.isArray(bookingData.sharedAccess)) {
            const sharedUser = bookingData.sharedAccess.find(
              (u: any) => String(u.pin).trim() === String(credentials.pin).trim()
            );

            if (sharedUser) {
              return {
                id: `${bookingData.booking_id}-${sharedUser.email}`, 
                name: sharedUser.email.split("@")[0],
                role: "customer",
                accessLevel: sharedUser.accessType || "viewer",
                huelineId: bookingData.booking_id,
                subdomainSlug: subdomainSlug,
              };
            }
          }

          console.log(`Auth Failed: PIN mismatch for ID ${credentials.huelineId}`);
          return null;

        } catch (error) {
          console.error("Critical Auth error:", error);
          return null; 
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.subdomainSlug = user.subdomainSlug;
        token.huelineId = user.huelineId;
        token.accessLevel = user.accessLevel;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.role = token.role as string;
        session.user.subdomainSlug = token.subdomainSlug as string;
        session.user.huelineId = token.huelineId as string;
        session.user.accessLevel = token.accessLevel as string;
      }
      return session;
    },
  },

  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};