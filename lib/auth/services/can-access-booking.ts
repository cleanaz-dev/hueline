// lib/auth/permissions.ts
import type { Session } from "next-auth";

export function canAccessBooking(session: Session | null, bookingSlug: string, bookingId: string) {
  if (!session?.user) return false;
  
  if (session.role === 'SUPER_ADMIN') return true; // God mode
  if (session.user.bookingId === bookingId) return true; // Guest
  
  // Owner check (Case insensitive is safer)
  if (
    session.user.subdomainSlug?.toLowerCase() === bookingSlug.toLowerCase() && 
    session.role !== 'customer'
  ) {
    return true; 
  }
  
  return false;
}