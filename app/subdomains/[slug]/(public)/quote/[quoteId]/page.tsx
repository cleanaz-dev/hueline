import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import SingleQuoteIdPage from "@/components/owner/quote/single-quote-id-page";
import { getQuote } from "@/lib/prisma/queries/quote/get-quote";

interface Params {
  params: Promise<{
    quoteId: string;
  }>;
}

export default async function Page({ params }: Params) {
  const { quoteId } = await params;

  // 1. FETCH QUOTE DATA
  const quote = await getQuote(quoteId);
  if (!quote || !quote.customer || !quote.booking) notFound();

  // 2. 🔒 SECURITY CHECK
  const session = await getServerSession(authOptions);

  const sessionCustomerId = (session?.user as any)?.customerId;
  const sessionHuelineId = (session?.user as any)?.huelineId?.toLowerCase();
  const sessionSlug = (session?.user as any)?.subdomainSlug?.toLowerCase();
  
  const customerSubdomainSlug = quote.booking.subdomain?.slug?.toLowerCase();

  // AUTH CONDITIONS
  // 1. Logged in customer matches quote's customer profile
  const isAuthorizedCustomer = Boolean(sessionCustomerId && sessionCustomerId === quote.customer.id);
  
  // 2. Fallback: Logged in specifically using this quote's booking ID
  const isAuthorizedBooking = Boolean(sessionHuelineId && sessionHuelineId === quote.booking.huelineId?.toLowerCase());
  
  // 3. Operator viewing quote within their own subdomain (Painter/Owner)
  const isAccountOperator = Boolean(
    sessionSlug === customerSubdomainSlug && 
    session?.role && 
    session.role !== "customer" && 
    session.role !== "customer-guest"
  ); 
    
  // 4. Global Admin
  const isSuperAdmin = session?.role === "SUPER_ADMIN";

  // FINAL AUTHORIZATION
  const isAuthorized = isAuthorizedCustomer || isAuthorizedBooking || isAccountOperator || isSuperAdmin;

  if (!isAuthorized) {
    const returnTo = encodeURIComponent(`/quote/${quoteId}`);
    
    // 1. Determine environment
    const isProd = process.env.NODE_ENV === "production";
    const protocol = isProd ? "https" : "http";
    
    // 2. Base domain (make sure to match your dev port, usually 3000)
    const baseDomain = isProd ? "hue-line.com" : "lvh.me:3000"; 
    
    // 3. Construct absolute URL: http://acme.lvh.me:3000/login?huelineId=123&callbackUrl=/quote/123
    const loginUrl = `${protocol}://${customerSubdomainSlug}.${baseDomain}/login?huelineId=${quote.booking.huelineId}&callbackUrl=${returnTo}`;
    
    // 4. Send them there!
    redirect(loginUrl);
  }

  // 3. DETERMINE EDIT PERMISSIONS
  // If they are an operator or super admin, they get owner privileges (editing capability)
  const isOwner = isAccountOperator || isSuperAdmin;

  // 4. RENDER PAGE
  return <SingleQuoteIdPage quote={quote} isOwner={isOwner} />;
}