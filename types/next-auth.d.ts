import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      subdomainSlug?: string;
      bookingId?: string;
      accessLevel?: string; // 'owner' | 'viewer'
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