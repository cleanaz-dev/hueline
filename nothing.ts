import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // === SKIP STATIC FILES & API ROUTES ===
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') && !pathname.endsWith('/')
  ) {
    return NextResponse.next();
  }

  // === HOSTNAME DETECTION ===
  const hostname = request.headers.get('host') || '';
  let currentHost = hostname;

  if (process.env.NODE_ENV === 'production') {
    // Handle both domain variations
    if (hostname.includes('.hue-line.com')) {
      currentHost = hostname.replace('.hue-line.com', '');
    } else if (hostname.includes('.hueline.com')) {
      currentHost = hostname.replace('.hueline.com', '');
    }
  } else {
    currentHost = hostname.replace('.localhost:3000', '');
  }

  console.log('🔍 Hostname:', hostname);
  console.log('🔍 Current Host:', currentHost);
  console.log('🔍 Pathname:', pathname);

  // === MAIN DOMAIN (non-subdomain) ===
  const isMainDomain = 
    currentHost === 'hue-line' ||
    currentHost === 'hueline' ||
    currentHost === 'www' ||
    currentHost === 'localhost:3000' ||
    currentHost === hostname; // No subdomain extracted

  if (isMainDomain) {
    return NextResponse.next();
  }

  // === SUBDOMAIN HANDLING ===
  
  // Allow auth pages without authentication
  if (pathname === '/login' || pathname === '/register') {
    console.log('🔍 Auth page - allowing access');
    return NextResponse.next();
  }

  // Check authentication for protected subdomain routes
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  console.log('🔍 Token exists:', !!token);

  // Redirect to login if not authenticated
  if (!token) {
    console.log('🔍 No token - redirecting to login');
    const loginUrl = url.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Rewrite to subdomain folder
  url.pathname = `/subdomains/${currentHost}${pathname}`;
  console.log('🔍 REWRITING TO:', url.pathname);
  
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};