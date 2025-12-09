import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "../config";

export async function verifySubdomainOwner(requestedSlug: string) {
  const session = await getServerSession(authOptions);

  // 1. Not logged in? -> Redirect to Login
  if (!session || !session.user) {
    // ✅ FIX: Redirect back to the ROOT of the subdomain, not /slug
    // This ensures they land on "demo.hueline.com/" after login
    redirect(`/login?callbackUrl=/`);
  }

  // 2. Is this a Customer (Booking Viewer)?
  if (session.role === "customer") {
    notFound(); 
  }

  // 3. Is this a Partner accessing the wrong subdomain?
  const isSaasUser = session.role !== "customer";
  const hasAccessToSubdomain = session.user.subdomainSlug === requestedSlug;

  if (!isSaasUser || !hasAccessToSubdomain) {
    console.warn(`⛔ Access Denied`);
    
    // If they have their OWN subdomain, send them there
    if (session.user.subdomainSlug) {
       redirect(`/${session.user.subdomainSlug}`); // Redirect to THEIR dashboard
    }

    notFound(); 
  }

  return session;
}