import { SubDomainWrapper } from "@/components/subdomains/subdomain-wrapper";
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

  // Normalize to lowercase to fix case-sensitivity issues
  const urlId = huelineId.toLowerCase();
  const sessionId = session?.user?.huelineId?.toLowerCase();
  const urlSlug = slug.toLowerCase();
  const sessionSlug = session?.user?.subdomainSlug?.toLowerCase();

  // AUTH CONDITIONS
  const isAuthorizedGuest = sessionId === urlId;
  const isAccountOwner =
    sessionSlug === urlSlug && session?.role && session.role !== "customer";
  const isSuperAdmin = session?.role === "SUPER_ADMIN";

  const isAuthorized = isAuthorizedGuest || isAccountOwner || isSuperAdmin;

  if (!isAuthorized) {
    // 🛑 CRITICAL FIX 🛑
    // We use a RELATIVE path.
    // If the user is at "demo.hue-line.com/booking/123",
    // this sends them to "demo.hue-line.com/login?huelineId=123"
    redirect(`/login?huelineId=${huelineId}`);
  }

  // 3. Render Page
  return <SubDomainWrapper booking={booking} subdomain={booking.subdomain} />;
}
