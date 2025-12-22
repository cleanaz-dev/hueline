import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;

  // 1. Skip internals
  if (
    url.pathname.startsWith("/_next") || 
    url.pathname.startsWith("/api") || 
    url.pathname.startsWith("/static") ||
    url.pathname.includes(".") // Skip files like favicon.ico, robots.txt
  ) {
    return NextResponse.next();
  }

  // 2. Hostname Logic
  const hostname = request.headers.get("host") || "";
  let currentHost = hostname;
  
  if (process.env.NODE_ENV === "production") {
    // Handle hue-line.com and app.hue-line.com as the main app
    if (hostname === "hue-line.com" || hostname === "app.hue-line.com") {
      currentHost = "app";
    } else {
      // tenant.hue-line.com -> tenant
      currentHost = hostname.replace(".hue-line.com", "");
    }
  } else {
    // Localhost logic
    if (hostname === "localhost:3000") {
      currentHost = "app";
    } else {
      // tenant.localhost:3000 -> tenant
      currentHost = hostname.replace(".localhost:3000", "");
    }
  }

  // 3. Main Domain Logic
  if (currentHost === "app") {
    // Optional: If you want to force app.hue-line.com users to /login if valid, do it here.
    // But DO NOT do it for subdomains.
    return NextResponse.next();
  }

  // 4. Subdomain Logic (The "Platform" part)
  
  // Allow Global Login/Register on Subdomains
  // This rewrites sub.hue-line.com/login -> app/login/page.tsx
  if (url.pathname === "/login" || url.pathname === "/register") {
    return NextResponse.rewrite(new URL(url.pathname, request.url));
  }

  // 5. Rewrite everything else to the subdomain folder
  // sub.hue-line.com/dashboard -> /subdomains/sub/dashboard
  url.pathname = `/subdomains/${currentHost}${url.pathname}`;
  
  return NextResponse.rewrite(url);
}