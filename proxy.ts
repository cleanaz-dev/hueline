import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;

  // 1. Skip internals
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Identify Host
  const hostname = request.headers.get("host") || "";
  let currentHost = hostname;
  let isMainDomain = false;

  if (process.env.NODE_ENV === "production") {
    if (hostname === "hue-line.com" || hostname === "www.hue-line.com") {
      isMainDomain = true;
    } else {
      currentHost = hostname.replace(`.hue-line.com`, "");
      isMainDomain = false;
    }
  } else {
    if (hostname === "localhost:3000") {
      isMainDomain = true;
    } else {
      currentHost = hostname.split(".")[0];
      isMainDomain = false;
    }
  }

  // 3. Get User Token
  // 🔥 CRITICAL FIX: Look for the specific cookie name we set in auth.ts
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: "hueline.session-token" 
  });

  // 4. Redirect logged-in users
  if (token && (url.pathname === "/login" || url.pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 5. Main Domain (Admin)
  if (isMainDomain) {
    if (!token && url.pathname !== "/login" && url.pathname !== "/register") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // 6. Subdomain Logic
  if (url.pathname === "/login" || url.pathname === "/register") {
    return NextResponse.rewrite(new URL(`/login`, request.url));
  }

  if (url.pathname.startsWith("/intake")) {
     return NextResponse.rewrite(
        new URL(`/subdomains/${currentHost}${url.pathname}`, request.url)
     );
  }

  if (!token) {
     return NextResponse.redirect(new URL(`/login`, request.url));
  }

  const searchParams = request.nextUrl.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

  return NextResponse.rewrite(
    new URL(`/subdomains/${currentHost}${path}`, request.url)
  );
}

export const config = {
  matcher: ["/((?!api/|_next/static/|_next/image|favicon.ico).*)"],
};