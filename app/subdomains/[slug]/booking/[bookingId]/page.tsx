import { SubDomainWrapper } from "@/components/subdomains/subdomain-wrapper";
import { getBookingByIdSlug } from "@/lib/prisma"; 
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

interface Props {
  params: Promise<{
    slug: string;
    bookingId: string;
  }>;
}

export default async function BookingPage({ params }: Props) {
  const { slug, bookingId } = await params;

  // 1. Fetch Data
  const data = await getBookingByIdSlug(bookingId, slug);
  if (!data || data.bookings.length === 0) notFound();

  // 2. 🔒 SECURITY CHECK
  const session = await getServerSession(authOptions);

  console.log(`🔐 Auth Check for [${slug}] / [${bookingId}]`);
  console.log("👤 User:", session);
  
  // --- AUTHORIZATION LOGIC ---

  // Condition A: Guest / Client (PIN Access)
  // They have a specific bookingId attached to their session
  const isAuthorizedGuest = session?.user?.bookingId === bookingId;

  // Condition B: Account Owner / Team Member
  // They are logged in as a SaaS user AND their slug matches the URL slug
  // We check that they are NOT a 'customer' (which is the role for PIN users)
  const isAccountOwner = 
    session?.user?.subdomainSlug === slug && 
    session?.role !== 'customer';

  // Condition C: Super Admin (Optional, if you have one)
  const isSuperAdmin = session?.role === 'SUPER_ADMIN';

  const isAuthorized = isAuthorizedGuest || isAccountOwner || isSuperAdmin;

  if (!isAuthorized) {
    console.warn("⛔ Access Denied");

    // 3. SMART REDIRECT
    // If they are logged in as an Owner but trying to access a DIFFERENT subdomain's booking,
    // don't send them to the PIN page. That's confusing.
    if (session?.user && !isAuthorizedGuest) {
       // Optional: Redirect to their own dashboard instead
       // redirect(`${process.env.NEXT_PUBLIC_URL}/dashboard`);
       return (
         <div className="flex h-screen items-center justify-center bg-gray-50">
           <div className="text-center">
             <h1 className="text-2xl font-bold text-gray-900">Unauthorized</h1>
             <p className="text-gray-500 mt-2">
               This booking belongs to a different organization.
             </p>
           </div>
         </div>
       );
    }

    // Default: Send them to the PIN Portal (Main Domain)
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const rootDomain = process.env.NODE_ENV === "production" ? "hue-line.com" : "localhost:3000";
    
    redirect(`${protocol}://${rootDomain}/p/${bookingId}`);
  }

  return (
    <SubDomainWrapper booking={data.bookings[0]} subdomain={data} />
  );
}