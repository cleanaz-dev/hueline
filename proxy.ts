import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;

  // 1. Skip static files and API routes
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Identify Host & Domain
  const hostname = request.headers.get("host") || "";
  let currentHost = hostname;
  let isMainDomain = false;

  // Adjust for Production vs Localhost
  if (process.env.NODE_ENV === "production") {
    // Matches "hue-line.com" and "www.hue-line.com"
    if (hostname === "hue-line.com" || hostname === "www.hue-line.com") {
      isMainDomain = true;
    } else {
      // Extract subdomain (e.g. "prestige" from "prestige.hue-line.com")
      currentHost = hostname.replace(`.hue-line.com`, "");
      isMainDomain = false;
    }
  } else {
    // Localhost logic (e.g. "prestige.localhost:3000")
    if (hostname === "localhost:3000") {
      isMainDomain = true;
    } else {
      currentHost = hostname.split(".")[0];
      isMainDomain = false;
    }
  }

  // 3. Get User Token
  // IMPORTANT: Ensure your NEXTAUTH_SECRET is set in .env
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // 4. Redirect logged-in users away from Login/Register
  if (token && (url.pathname === "/login" || url.pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 5. MAIN DOMAIN LOGIC (Admin Dashboard)
  if (isMainDomain) {
    // If accessing the Dashboard (root) without a token, force Login
    if (!token && url.pathname !== "/login" && url.pathname !== "/register") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Otherwise, render the page normally
    return NextResponse.next();
  }

  // 6. SUBDOMAIN LOGIC
  
  // A. Allow public access to Login/Register on subdomains
  // We rewrite this to the MAIN login page so it renders correctly
  if (url.pathname === "/login" || url.pathname === "/register") {
    return NextResponse.rewrite(new URL(`/login`, request.url));
  }

  // B. Allow public paths (optional - e.g. intake forms)
  if (url.pathname.startsWith("/intake")) {
     return NextResponse.rewrite(
        new URL(`/subdomains/${currentHost}${url.pathname}`, request.url)
     );
  }

  // C. Protect all other Subdomain routes
  if (!token) {
     // If they are not logged in, send them to login
     return NextResponse.redirect(new URL(`/login`, request.url));
  }

  // D. Rewrite valid subdomain requests to the dynamic folder
  const searchParams = request.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

  return NextResponse.rewrite(
    new URL(`/subdomains/${currentHost}${path}`, request.url)
  );
}

// Next.js 16 requires this named export convention
export const config = {
  matcher: ["/((?!api/|_next/static/|_next/image|favicon.ico).*)"],
};