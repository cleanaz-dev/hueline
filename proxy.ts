import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;

  // 1. Skip internals
  if (url.pathname.startsWith("/_next") || url.pathname.includes("/api/")) {
    return NextResponse.next();
  }
  
  // -----------------------------------------------------------------------------
  // HOST & DOMAIN PARSING
  // -----------------------------------------------------------------------------
  const hostname = request.headers.get("host") || "";
  let currentHost = hostname;
  let isMainDomain = false;

  if (process.env.NODE_ENV === 'production') {
    // Production: hue-line.com, www.hue-line.com, app.hue-line.com -> Main
    if (hostname === 'hue-line.com' || hostname === 'www.hue-line.com' || hostname === 'app.hue-line.com') {
      currentHost = 'app';
      isMainDomain = true;
    } else {
      // Subdomain: tenant.hue-line.com -> tenant
      currentHost = hostname.replace('.hue-line.com', '');
      isMainDomain = false;
    }
  } else {
    // Localhost: localhost:3000 -> Main
    if (hostname === 'localhost:3000') {
      currentHost = 'app';
      isMainDomain = true;
    } else {
      // Subdomain: tenant.localhost:3000 -> tenant
      currentHost = hostname.replace('.localhost:3000', '');
      isMainDomain = false;
    }
  }

  // -----------------------------------------------------------------------------
  // CRITICAL: PORTAL ENTRY (/p/) PROTECTION
  // -----------------------------------------------------------------------------
  // Logic: If a user tries to access /p/123 from a Subdomain, 
  // Force Redirect to Main Domain. 
  // WHY: We need the cookie to be set on the Root Domain, not the subdomain.
  if (url.pathname.startsWith("/p/") && !isMainDomain) {
    const mainDomainUrl = new URL(url.pathname, request.url);
    if (process.env.NODE_ENV === 'production') {
       mainDomainUrl.hostname = "app.hue-line.com"; 
       mainDomainUrl.protocol = "https";
    } else {
       mainDomainUrl.hostname = "localhost";
       mainDomainUrl.port = "3000";
       mainDomainUrl.protocol = "http";
    }
    return NextResponse.redirect(mainDomainUrl);
  }

  // -----------------------------------------------------------------------------
  // AUTHENTICATION & SECURITY BOUNDARY
  // -----------------------------------------------------------------------------
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // 🛡️ ADMIN ROUTES
  if (url.pathname.startsWith("/admin")) {
    if (!isMainDomain) return NextResponse.rewrite(new URL("/404", request.url));
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    if (token.role !== "SUPER_ADMIN") return new NextResponse("Unauthorized", { status: 403 });
  }

  // 🛡️ DASHBOARD ROUTES
  if (url.pathname.startsWith("/dashboard")) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    // Enforce Tenant Isolation
    if (!isMainDomain && token.subdomainSlug !== currentHost) {
      if (token.role !== "SUPER_ADMIN") {
        return new NextResponse("Unauthorized", { status: 403 });
      }
    }
  }

  // -----------------------------------------------------------------------------
  // ROUTING & REWRITES
  // -----------------------------------------------------------------------------
  
  // 1. Main Domain Traffic
  // Serves from root app/ folder (e.g. app/p/, app/login)
  if (isMainDomain) {
    return NextResponse.next();
  }

  // 2. Subdomain Traffic
  // Rewrites to app/subdomains/[slug]/...
  const searchParams = request.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`;
  
  return NextResponse.rewrite(
    new URL(`/subdomains/${currentHost}${path}`, request.url)
  );
}

export const config = {
  matcher: [
    "/((?!api/|_next/static/|_next/image|favicon.ico).*)",
  ],
};