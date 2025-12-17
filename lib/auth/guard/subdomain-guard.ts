import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../config";
import { headers } from "next/headers";

export async function verifySubdomainOwner(requestedSlug: string) {
  const session = await getServerSession(authOptions);
  
  // 1. Skip check if already on login page (Prevent Loops)
  const h = await headers();
  const pathname = h.get('x-invoke-path') || '';
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return session; 
  }

  // 2. If no session, go to /login (Relative path)
  // This keeps the user on "tesla.localhost" so the cookie works.
  if (!session || !session.user) {
    redirect("/login"); 
  }

  // 3. Check ownership
  if (session.user.subdomainSlug !== requestedSlug) {
    // Wrong subdomain? Send to login to switch accounts or re-auth
    redirect("/login");
  }

  return session;
}