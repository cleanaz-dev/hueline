import { NextResponse } from "next/server";
import type { NextRequest } from "next/server"; // Type import
import { getToken } from "next-auth/jwt";

// Next.js 16: Named export 'proxy'
export async function proxy(request: NextRequest) {
  const url = request.nextUrl;

  // 1. Skip static files, APIs, and images
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.includes(".") // Skips .png, .jpg, etc.
  ) {
    return NextResponse.next();
  }

  // 2. Identify Host & Domain
  const hostname = request.headers.get("host") || "";
  let currentHost = hostname;
  let isMainDomain = false;

  if (process.env.NODE_ENV === "production") {
    // Matches "hue-line.com" and "www.hue-line.com"
    if (hostname === "hue-line.com" || hostname === "www.hue-line.com") {
      isMainDomain = true;
    } else {
      currentHost = hostname.replace(`.hue-line.com`, "");
      isMainDomain = false;
    }
  } else {
    // Localhost logic
    if (hostname === "localhost:3000") {
      isMainDomain = true;
    } else {
      currentHost = hostname.split(".")[0];
      isMainDomain = false;
    }
  }

  // 3. Get User Token
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // 4. Redirect logged-in users AWAY from Login/Register
  if (token && (url.pathname === "/login" || url.pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 5. MAIN DOMAIN LOGIC (Admin Dashboard)
  if (isMainDomain) {
    // CRITICAL FIX FOR LOOP:
    // Only redirect to login if we are NOT already on the login page
    if (!token && url.pathname !== "/login" && url.pathname !== "/register") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Allow /login to pass through
    return NextResponse.next();
  }

  // 6. SUBDOMAIN LOGIC
  
  // A. Public Login/Register on subdomains -> Rewrite to global Login
  if (url.pathname === "/login" || url.pathname === "/register") {
    return NextResponse.rewrite(new URL(`/login`, request.url));
  }

  // B. Public Intake Forms (Allow pass-through)
  if (url.pathname.startsWith("/intake")) {
     return NextResponse.rewrite(
        new URL(`/subdomains/${currentHost}${url.pathname}`, request.url)
     );
  }

  // C. Protect all other Subdomain routes
  if (!token) {
     return NextResponse.redirect(new URL(`/login`, request.url));
  }

  // D. Rewrite valid subdomain requests to the dynamic folder
  const searchParams = request.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

  return NextResponse.rewrite(
    new URL(`/subdomains/${currentHost}${path}`, request.url)
  );
}

// Next.js 16 Configuration
export const config = {
  matcher: ["/((?!api/|_next/static/|_next/image|favicon.ico).*)"],
};