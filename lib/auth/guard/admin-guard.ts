import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../config";
import { headers } from "next/headers";

export async function verifySuperAdmin() {
  const session = await getServerSession(authOptions);
  
  // 1. Skip check if already on login page (Prevent Loops)
  const h = await headers();
  const pathname = h.get('x-invoke-path') || '';
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return session; 
  }

  // 2. If no session, go to /login (Relative path)
  if (!session || !session.user) {
    redirect("/login"); 
  }

  // 3. Check if user is SUPER_ADMIN
  if (session?.role !== 'SUPER_ADMIN') {
    // Not a super admin? Redirect to unauthorized or home page
    redirect("/unauthorized"); // or redirect("/") depending on your preference
  }

  return session;
}