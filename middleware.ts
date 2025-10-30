import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  // ✅ Bypass all API routes and internal assets
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const subdomain = hostname.split('.')[0];

  // ✅ Bypass local and main domain
  if (
    hostname.includes('localhost') ||
    hostname.includes('ngrok') ||
    hostname === 'hue-line.com' ||
    hostname === 'www.hue-line.com'
  ) {
    return NextResponse.next();
  }

  // 🧭 Rewrite subdomains only
  const url = request.nextUrl.clone();
  url.pathname = `/subdomains/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
