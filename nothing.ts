import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;

  // === SKIP INTERNALS & AUTH PAGES ===
  if (
    url.pathname.startsWith("/_next") || 
    url.pathname.startsWith("/api") || 
    url.pathname.startsWith("/static") ||
    url.pathname.includes(".") ||
    url.pathname === "/login" ||      // ALLOW login
    url.pathname === "/register"     // ALLOW register
  ) {
    return NextResponse.next();
  }

  // === HOSTNAME LOGIC ===
  const hostname = request.headers.get("host") || "";
  let currentHost = hostname;

  if (process.env.NODE_ENV === "production") {
    if (hostname === "hue-line.com" || hostname === "app.hue-line.com") {
      currentHost = "app";
    } else {
      currentHost = hostname.replace(".hue-line.com", "");
    }
  } else {
    if (hostname === "localhost:3000") {
      currentHost = "app";
    } else {
      currentHost = hostname.replace(".localhost:3000", "");
    }
  }

  // === MAIN DOMAIN: DON'T REDIRECT ROOT ===
  if (currentHost === "app") {
    // Let "/" load the landing page
    if (url.pathname === "/") {
      return NextResponse.next();
    }
  }

  // === SUBDOMAIN LOGIC ===
  if (currentHost !== "app") {
    if (url.pathname === "/login" || url.pathname === "/register") {
      return NextResponse.rewrite(new URL(url.pathname, request.url));
    }
    url.pathname = `/subdomains/${currentHost}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};