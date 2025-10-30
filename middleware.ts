import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];
  
  console.log('🔍 Hostname:', hostname);
  console.log('🔍 Subdomain:', subdomain);
  console.log('🔍 Pathname:', request.nextUrl.pathname);

  // Skip main domain (but allow subdomains on localhost)
  if (
    subdomain === 'www' ||
    hostname === 'hueline.com' ||
    hostname === 'localhost:3000'  // ← Change to exact match
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/subdomains/${subdomain}${url.pathname}`;
  console.log('🔍 REWRITING TO:', url.pathname);
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};