import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "../config";

export async function verifySubdomainOwner(requestedSlug: string) {
  const session = await getServerSession(authOptions);

  const appLoginUrl = process.env.NODE_ENV === 'production'
    ? 'https://hue-line.com/login'
    : 'http://localhost:3000/login';

  // 1. Not logged in? -> Redirect to main app login
  if (!session || !session.user) {
    redirect(appLoginUrl);
  }

  // 2. Super admin can access everything
  if (session.role === "SUPER_ADMIN") {
    return session;
  }

  // 3. Customer? -> Redirect to main app login
  if (session.role === "customer") {
    redirect(appLoginUrl);
  }

  // 4. Wrong subdomain? -> Redirect to main app login
  if (session.user.subdomainSlug !== requestedSlug) {
    console.warn(`⛔ Access Denied - wrong subdomain`);
    redirect(appLoginUrl);
  }

  return session;
}