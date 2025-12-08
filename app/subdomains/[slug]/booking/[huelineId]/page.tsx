import { SubDomainWrapper } from "@/components/subdomains/subdomain-wrapper";
import { getBookingByIdSlug } from "@/lib/prisma"; 
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getBookingForPage } from "@/lib/prisma/queries/get-booking-for-page";

interface Props {
  params: Promise<{
    slug: string;
    huelineId: string; 
  }>;
}

export default async function BookingPage({ params }: Props) {
  const { slug, huelineId } = await params;

  // 1. Fetch Data
  const booking = await getBookingForPage(huelineId, slug);
  
  if (!booking) notFound();

  // 2. 🔒 SECURITY CHECK
  const session = await getServerSession(authOptions);

  console.log(`🔐 Auth Check for [${slug}] / [${huelineId}]`);
  
  // --- AUTHORIZATION LOGIC ---

  // Condition A: Guest / Client (PIN Access)
  const isAuthorizedGuest = session?.user?.huelineId === huelineId;

  // Condition B: Account Owner / Team Member
  const isAccountOwner = 
    session?.user?.subdomainSlug?.toLowerCase() === slug.toLowerCase() && 
    session?.role !== 'customer';

  // Condition C: Super Admin
  const isSuperAdmin = session?.role === 'SUPER_ADMIN';

  const isAuthorized = isAuthorizedGuest || isAccountOwner || isSuperAdmin;

  if (!isAuthorized) {
    console.warn("⛔ Access Denied");

    // 3. SMART REDIRECT (Owner trying to access wrong subdomain)
    if (session?.user && !isAuthorizedGuest) {
       return (
         <div className="flex h-screen items-center justify-center bg-gray-50">
           <div className="text-center">
             <h1 className="text-2xl font-bold text-gray-900">Unauthorized</h1>
             <p className="text-gray-500 mt-2">
               This project belongs to a different organization.
             </p>
           </div>
         </div>
       );
    }

    // Default: Send them to the PIN Portal using the new HL-ID
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const rootDomain = process.env.NODE_ENV === "production" ? "hue-line.com" : "localhost:3000";
    
    redirect(`${protocol}://${rootDomain}/p/${huelineId}`);
  }

  return (
      <SubDomainWrapper booking={booking} subdomain={booking.subdomain} />
  );
}