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
  const sessionId = (session?.user as any)?.huelineId?.toLowerCase(); // Cast to any to ensure we log it even if types are off
  const urlSlug = slug.toLowerCase();
  const sessionSlug = session?.user?.subdomainSlug?.toLowerCase();

  // AUTH CONDITIONS
  const isAuthorizedGuest = sessionId === urlId;
  const isAccountOwner =
    sessionSlug === urlSlug && session?.role && session.role !== "customer";
  const isSuperAdmin = session?.role === "SUPER_ADMIN";

  const isAuthorized = isAuthorizedGuest || isAccountOwner || isSuperAdmin;

  // 🔍🔍🔍 DEBUG LOGGING START 🔍🔍🔍
  console.log("\n========================================================");
  console.log("🕵️‍♂️ [AUTH DEBUG] Checking Access for:", `/${slug}/booking/${huelineId}`);
  console.log("========================================================");
  
  console.log("1. 📥 INPUTS:");
  console.log(`   - URL Slug:       "${urlSlug}"`);
  console.log(`   - URL HuelineID:  "${urlId}"`);

  console.log("2. 🔑 SESSION:");
  if (!session) {
    console.log("   - ❌ Session is NULL/UNDEFINED. (Cookie missing or domain mismatch)");
  } else {
    console.log("   - ✅ Session found:", JSON.stringify(session.user, null, 2));
    console.log(`   - Session ID:     "${sessionId}"`);
    console.log(`   - Session Role:   "${session.role}"`);
    console.log(`   - Session Slug:   "${sessionSlug}"`);
  }

  console.log("3. ⚖️ CHECKS:");
  console.log(`   - isAuthorizedGuest (SessionID === URLID): ${isAuthorizedGuest ? "✅" : "❌"} ("${sessionId}" vs "${urlId}")`);
  console.log(`   - isAccountOwner:                          ${isAccountOwner ? "✅" : "❌"}`);
  console.log(`   - isSuperAdmin:                            ${isSuperAdmin ? "✅" : "❌"}`);
  console.log(`   - 🏁 FINAL DECISION (isAuthorized):        ${isAuthorized ? "ALLOWED" : "DENIED"}`);
  console.log("========================================================\n");
  // 🔍🔍🔍 DEBUG LOGGING END 🔍🔍🔍

  if (!isAuthorized) {
    console.log("🚫 [AUTH DEBUG] Redirecting to login...");
    // 🛑 CRITICAL FIX 🛑
    redirect(`/login?huelineId=${huelineId}`);
  }

  // 3. Render Page
  return <SubDomainWrapper booking={booking} subdomain={booking.subdomain} />;
}