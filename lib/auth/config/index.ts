import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { getBooking } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Determine the cookie domain based on environment
// Production: .hue-line.com (accessible by app.hue-line.com and tenant.hue-line.com)
// Development: localhost (accessible by app.localhost and tenant.localhost)
const cookieDomain = process.env.NODE_ENV === 'production' 
  ? '.hue-line.com' 
  : 'localhost'; // Changed from undefined to 'localhost'

export const authOptions: NextAuthOptions = {
  // ------------------------------------------------------------------
  // 1. COOKIE CONFIGURATION (The "Glue" for Subdomains)
  // ------------------------------------------------------------------
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax', // 'lax' is best for redirects between subdomains
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: cookieDomain
      }
    }
  },

  providers: [
    // ------------------------------------------------------------------
    // PROVIDER A: SAAS ACCOUNTS (Partners & Super Admin)
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

        const user = await prisma.subdomainUser.findUnique({
          where: { email: credentials.email },
          include: { subdomain: true } // We need this to know where to redirect them
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name || user.email.split("@")[0],
          email: user.email,
          role: user.role, // e.g., 'account_owner', 'SUPER_ADMIN'
          subdomainSlug: user.subdomain?.slug,
        };
      },
    }),

    // ------------------------------------------------------------------
    // PROVIDER B: CLIENT PORTAL (The Booking Access)
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

        // 1. Redis Check (Fast Path)
        const redisData = await getBooking(credentials.bookingId);
        
        if (redisData) {
          bookingData = redisData;
          
          // Optimization Note: In the future, save 'slug' directly in Redis 
          // to avoid this extra Prisma call.
          if (redisData.subdomain_id) {
             const subdomain = await prisma.subdomain.findUnique({
                where: { id: redisData.subdomain_id },
                select: { slug: true }
             });
             subdomainSlug = subdomain?.slug;
          }
        } 
        
        // 2. Database Fallback (Slow Path / Cache Miss)
        if (!bookingData) {
          const dbBooking = await prisma.subBookingData.findUnique({
            where: { bookingId: credentials.bookingId },
            include: { subdomain: true, sharedAccess: true }
          });

          if (dbBooking) {
            bookingData = { ...dbBooking, booking_id: dbBooking.bookingId };
            subdomainSlug = dbBooking.subdomain?.slug;
          }
        }

        if (!bookingData) return null;

        // 3. Verify PIN (Owner)
        if (String(bookingData.pin) === String(credentials.pin)) {
          return {
            id: bookingData.booking_id,
            name: bookingData.name || "Guest",
            role: "customer",
            accessLevel: "owner",
            bookingId: bookingData.booking_id,
            subdomainSlug: subdomainSlug || "app", // Fallback to 'app' if orphan
          };
        }

        // 4. Verify PIN (Shared Access / Family)
        if (bookingData.sharedAccess && Array.isArray(bookingData.sharedAccess)) {
          const sharedUser = bookingData.sharedAccess.find(
            (u: any) => String(u.pin) === String(credentials.pin)
          );

          if (sharedUser) {
            return {
              // Composite ID to ensure uniqueness for shared users
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

  // This directs unauthenticated users. 
  // SaaS users go here naturally. 
  // Portal users bypass this via custom login forms.
  pages: { signIn: "/login" }, 
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};