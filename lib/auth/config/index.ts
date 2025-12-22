import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { getBooking } from "@/lib/redis"; // Ensure this path is correct
import { prisma } from "@/lib/prisma";   // Ensure this path is correct
import bcrypt from "bcryptjs";

const useSecureCookies = process.env.NODE_ENV === "production";
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

// HARDCODE YOUR DOMAIN HERE to avoid parsing errors
// If testing locally, use "localhost". If prod, use ".hue-line.com"
const rootDomain = process.env.NODE_ENV === "production" ? ".hue-line.com" : undefined;

export const authOptions: NextAuthOptions = {
  // Debug mode helps find the loop cause
  debug: process.env.NODE_ENV !== "production",
  
  session: { strategy: "jwt" },
  
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        domain: rootDomain, // <--- CRITICAL FIX
      },
    },
  },

  providers: [
    // ... keep your existing providers code exactly as is ...
    // (I am omitting the providers block here to save space, paste your previous code back in)
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
    CredentialsProvider({
        id: "booking-portal",
        name: "Booking Access",
        credentials: {
          huelineId: { label: "Hueline ID", type: "text" },
          pin: { label: "PIN", type: "text" },
        },
        async authorize(credentials) {
            // ... insert your existing logic here ...
             try {
                if (!credentials?.huelineId || !credentials?.pin) return null;

                let bookingData: any = null;
                let subdomainSlug = "app";

                // A. Redis Check
                const redisData = await getBooking(credentials.huelineId);
                if (redisData) {
                    bookingData = {
                    ...redisData,
                    booking_id: redisData.hueline_id || redisData.booking_id,
                    pin: redisData.pin 
                    };
                    // Map Redis subdomain_id to slug if needed, or default to app
                    if (redisData.subdomain_id) {
                        const sub = await prisma.subdomain.findUnique({ where: { id: redisData.subdomain_id }});
                        if(sub) subdomainSlug = sub.slug;
                    }
                } 
                
                // B. DB Fallback (Insensitive Check)
                if (!bookingData) {
                    const dbBooking = await prisma.subBookingData.findFirst({
                    where: { 
                        huelineId: { equals: credentials.huelineId, mode: "insensitive" }
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

                if (!bookingData) return null;

                // C. Verify PIN
                if (String(bookingData.pin).trim() === String(credentials.pin).trim()) {
                    return {
                    id: bookingData.booking_id,
                    name: bookingData.name || "Guest",
                    role: "customer",
                    accessLevel: "owner",
                    huelineId: bookingData.booking_id, 
                    subdomainSlug: subdomainSlug,
                    };
                }

                // D. Shared Access
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
                return null;
                } catch (error) {
                console.error("Auth Error", error);
                return null; 
                }
        }
    })
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

  pages: { 
    signIn: "/login",
    // Ensure you have an error page or loops can happen on auth fail
    error: "/login" 
  },
  secret: process.env.NEXTAUTH_SECRET,
};