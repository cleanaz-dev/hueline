import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, DefaultSession } from "next-auth";
import { getBooking } from "@/lib/redis"; // Your Redis fetcher
import { prisma } from "@/lib/prisma";   // Your DB connection
import bcrypt from "bcryptjs";

// 1. Type Definitions
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      subdomainSlug?: string;
      bookingId?: string;
      accessLevel?: string; // "owner", "viewer"
    } & DefaultSession["user"];
    role?: string;
  }

  interface User {
    id: string;
    role?: string;
    subdomainSlug?: string;
    bookingId?: string;
    accessLevel?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    subdomainSlug?: string;
    bookingId?: string;
    accessLevel?: string;
  }
}

export const authOptions: NextAuthOptions = {
  // 🍪 Cookie Configuration
  // Allows the session to persist across subdomains (app.domain.com -> joe.domain.com)
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.hue-line.com' : undefined 
      }
    }
  },

  providers: [
    // ------------------------------------------------------------------
    // PROVIDER A: SAAS OWNERS (The Painters)
    // ------------------------------------------------------------------
    CredentialsProvider({
      id: "saas-account",
      name: "Partner Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Fetch User + Subdomain Slug
        const user = await prisma.subdomainUser.findUnique({
          where: { email: credentials.email },
          include: { subdomain: true } // Need this to redirect them correctly!
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name || user.email.split("@")[0],
          email: user.email,
          role: "saas_owner",
          subdomainSlug: user.subdomain?.slug, 
        };
      },
    }),

    // ------------------------------------------------------------------
    // PROVIDER B: CLIENT PORTAL (Fail-Safe Logic)
    // ------------------------------------------------------------------
    CredentialsProvider({
      id: "booking-portal",
      name: "Booking Access",
      credentials: {
        bookingId: { label: "Booking ID", type: "text" },
        pin: { label: "PIN", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.bookingId || !credentials?.pin) return null;

        let bookingData: any = null;
        let subdomainSlug: string | undefined = undefined;

        // 🟢 STEP 1: CHECK REDIS (The "Buffer")
        const redisData = await getBooking(credentials.bookingId);
        
        if (redisData) {
          bookingData = redisData;
          
          // The Agent now sends 'subdomain_id'. We use this to find the live slug.
          // This is safer than hardcoding the slug in Redis.
          if (redisData.subdomain_id) {
            const subdomain = await prisma.subdomain.findUnique({
              where: { id: redisData.subdomain_id },
              select: { slug: true }
            });
            subdomainSlug = subdomain?.slug;
          }
        } 
        
        // 🟠 STEP 2: CHECK MONGODB (The "Vault")
        // If Redis failed or expired, we look here.
        if (!bookingData) {
          const dbBooking = await prisma.subBookingData.findUnique({
            where: { bookingId: credentials.bookingId },
            include: { 
              subdomain: true, // Get the slug!
              sharedAccess: true // Get the viewers!
            }
          });

          if (dbBooking) {
            bookingData = {
              ...dbBooking,
              booking_id: dbBooking.bookingId, // Normalize to match Redis structure
            };
            subdomainSlug = dbBooking.subdomain?.slug;
          }
        }

        // If neither Redis nor DB has it, access denied.
        if (!bookingData) return null;

        // 🔵 STEP 3: VERIFY PIN (The Gatekeeper)
        
        // A. Is it the Owner?
        if (String(bookingData.pin) === String(credentials.pin)) {
          return {
            id: bookingData.booking_id,
            name: bookingData.name,
            role: "customer",
            accessLevel: "owner", // Full Access
            bookingId: bookingData.booking_id,
            subdomainSlug: subdomainSlug || "app",
          };
        }

        // B. Is it a Shared Viewer?
        if (bookingData.sharedAccess && Array.isArray(bookingData.sharedAccess)) {
          const sharedUser = bookingData.sharedAccess.find(
            (u: any) => String(u.pin) === String(credentials.pin)
          );

          if (sharedUser) {
            return {
              id: `${bookingData.booking_id}-${sharedUser.email}`, // Unique Session ID
              name: sharedUser.email.split("@")[0],
              role: "customer",
              accessLevel: sharedUser.accessType || "viewer", // "viewer"
              bookingId: bookingData.booking_id,
              subdomainSlug: subdomainSlug || "app",
            };
          }
        }

        return null;
      },
    }),
  ],

  // 4. Session Handling
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
      if (token) {
        session.user.id = token.id as string;
        session.role = token.role as string;
        session.user.subdomainSlug = token.subdomainSlug as string;
        session.user.bookingId = token.bookingId as string;
        session.user.accessLevel = token.accessLevel as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
  
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};