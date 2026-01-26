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
        // 🛑 FIX: Don't force a domain in dev. Let the browser determine it.
        // If undefined, it defaults to the current host (e.g., demo.lvh.me)
        domain: isProd ? ".hue-line.com" : undefined, 
      },
    },
    csrfToken: {
      name: isProd ? `__Host-next-auth.csrf-token` : `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
        // 🛑 FIX: Same here
        domain: isProd ? ".hue-line.com" : undefined,
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
        const user = await prisma.subdomainUser.findUnique({
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
          include: { subdomain: true },
        });
        if (!dbBooking || String(dbBooking.pin) !== String(credentials?.pin))
          return null;
        return {
          id: dbBooking.huelineId,
          role: "customer",
          subdomainSlug: dbBooking.subdomain?.slug,
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
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.role = token.role as string;
        session.user.subdomainSlug = token.subdomainSlug as string;

        // 🔥 ADD THIS LINE 🔥
        // We map the token ID to huelineId so your page logic works
        (session.user as any).huelineId = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
