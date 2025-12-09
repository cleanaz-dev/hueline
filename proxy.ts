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
    if (hostname === 'hue-line.com' || hostname === 'www.hue-line.com' || hostname === 'app.hue-line.com') {
      currentHost = 'app';
      isMainDomain = true;
    } else {
      currentHost = hostname.replace('.hue-line.com', '');
      isMainDomain = false;
    }
  } else {
    if (hostname === 'localhost:3000') {
      currentHost = 'app';
      isMainDomain = true;
    } else {
      currentHost = hostname.replace('.localhost:3000', '');
      isMainDomain = false;
    }
  }

  // -----------------------------------------------------------------------------
  // CRITICAL: PORTAL ENTRY (/p/) PROTECTION
  // -----------------------------------------------------------------------------
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

  // 🔥 FIX: If user is ALREADY logged in and tries to go to /login, FORCE them to /
  // This ensures that after you sign in, if the router tries to stay on /login, the server pushes you to root.
  if (token && (url.pathname === "/login" || url.pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (url.pathname.startsWith("/admin")) {
    if (!isMainDomain) return NextResponse.rewrite(new URL("/404", request.url));
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    if (token.role !== "SUPER_ADMIN") return new NextResponse("Unauthorized", { status: 403 });
  }

  if (url.pathname.startsWith("/dashboard")) {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
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
  if (isMainDomain) {
    return NextResponse.next();
  }

  // 2. Subdomain Traffic
  
  // If we are here, we are on a subdomain (e.g. demo.hue-line.com)
  // If the path is /login, we show the global login page.
  // (Note: The check we added above ensures only LOGGED OUT users see this)
  if (url.pathname === "/login" || url.pathname === "/register") {
    return NextResponse.rewrite(new URL(url.pathname, request.url));
  }

  // Otherwise, rewrite to app/subdomains/[slug]/...
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