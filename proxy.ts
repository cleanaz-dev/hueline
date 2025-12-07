// proxy.ts
import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;

  // 1. Skip Next.js internals and APIs
  // This prevents the proxy from breaking images, fonts, and HMR
  if (url.pathname.startsWith("/_next") || url.pathname.includes("/api/")) {
    return NextResponse.next();
  }
  
  const hostname = request.headers.get("host") || "";

  // -----------------------------------------------------------------------------
  // A. SUBDOMAIN EXTRACTION
  // -----------------------------------------------------------------------------
  let currentHost = hostname;

  if (process.env.NODE_ENV === 'production') {
    // Handle root domain removal for production
    if (hostname.includes('.hue-line.com')) {
      currentHost = hostname.replace('.hue-line.com', '');
    } else if (hostname.includes('.hueline.com')) {
      currentHost = hostname.replace('.hueline.com', '');
    }
  } else {
    // Handle localhost
    currentHost = hostname.replace('.localhost:3000', '');
  }

  // Define "Main" domains (No rewrite needed)
  const isMainDomain =
    currentHost === 'hue-line' ||
    currentHost === 'hueline' ||
    currentHost === 'www' ||
    currentHost === 'app' ||
    currentHost === 'localhost:3000';

  console.log(`[Proxy] Path: ${url.pathname} | Host: ${currentHost} | IsMain: ${isMainDomain}`);

  // -----------------------------------------------------------------------------
  // B. AUTHENTICATION & SECURITY BOUNDARY
  // -----------------------------------------------------------------------------
  // Only run heavy auth checks on specific protected paths
  if (url.pathname.startsWith("/dashboard")) {
    
    // Check session (Works across subdomains due to wildcard cookie)
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // 1. Not Logged In? -> Redirect to Login
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      
      // Force redirect to the main domain (app. or www.) to capture credentials
      if (process.env.NODE_ENV === 'production') {
         loginUrl.hostname = "app.hue-line.com"; 
         loginUrl.protocol = "https";
      } else {
         loginUrl.hostname = "localhost";
         loginUrl.port = "3000";
      }
      return NextResponse.redirect(loginUrl);
    }

    // 2. Logged in, but wrong Subdomain? (Tenant Isolation)
    if (!isMainDomain && token.subdomainSlug !== currentHost) {
      // If it's an account owner trying to access another painter's dashboard
      if (token.role === 'account_owner') {
        return new NextResponse("Unauthorized: You do not own this subdomain.", { status: 403 });
      }
      // Note: We allow 'customers' (who have no slug) to pass through if they have the PIN 
    }
  }

  // -----------------------------------------------------------------------------
  // C. ROUTING & REWRITES
  // -----------------------------------------------------------------------------
  
  // 1. If main domain, serve normally (app/page.tsx)
  if (isMainDomain) {
    return NextResponse.next();
  }

  // 2. 🟢 UNIVERSAL PORTAL RULE
  // If the path is /p/, serve the global file at app/p/... 
  // without digging into the subdomain folder.
  // This allows davinci.hue-line.com/p/123 to work seamlessly.
  if (url.pathname.startsWith("/p/")) {
    return NextResponse.rewrite(url);
  }

  // 3. If subdomain, rewrite to /subdomains/[slug]
  // This tells Next.js to render app/subdomains/[slug]/page.tsx
  url.pathname = `/subdomains/${currentHost}${url.pathname}`;
  
  return NextResponse.rewrite(url);
}

// Export Configuration
export const config = {
  matcher: [
    "/((?!api/|_next/static/|_next/image/|favicon.ico|images/).*)",
  ],
};