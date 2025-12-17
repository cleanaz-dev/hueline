import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;

  // 1. Skip internals
  if (url.pathname.startsWith("/_next") || url.pathname.includes("/api/")) {
    return NextResponse.next();
  }

  // 2. Hostname Logic
  const hostname = request.headers.get("host") || "";
  let currentHost = hostname;
  let isMainDomain = false;

  if (process.env.NODE_ENV === "production") {
    if (hostname === "hue-line.com" || hostname === "app.hue-line.com") {
      currentHost = "app";
      isMainDomain = true;
    } else {
      currentHost = hostname.replace(".hue-line.com", "");
      isMainDomain = false;
    }
  } else {
    // Localhost
    if (hostname === "localhost:3000") {
      currentHost = "app";
      isMainDomain = true;
    } else {
      const parts = hostname.split(".");
      currentHost = parts[0];
      isMainDomain = false;
    }
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // 3. Auth Redirect (If logged in, kick away from login page)
  if (token && (url.pathname === "/login" || url.pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 4. Main Domain - pass through
  if (isMainDomain) {
    return NextResponse.next();
  }

  // 🔥 THE FIX: Allow Login on Subdomains
  // If we are on 'tesla.localhost', and visiting '/login', we rewrite to the 
  // GLOBAL login page so the user can log in RIGHT HERE (setting the cookie here).
  if (url.pathname === "/login" || url.pathname === "/register") {
    return NextResponse.rewrite(new URL(url.pathname, request.url));
  }

  // 5. Rewrite everything else to the subdomain folder
  const searchParams = request.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

  return NextResponse.rewrite(
    new URL(`/subdomains/${currentHost}${path}`, request.url)
  );
}

export const config = {
  matcher: ["/((?!api/|_next/static/|_next/image|favicon.ico).*)"],
};