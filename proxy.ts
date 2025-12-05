import { NextResponse, NextRequest } from 'next/server';

export function proxy(request: NextRequest) {  // ← Changed from 'middleware' to 'proxy'
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];
  
  console.log('🔍 Hostname:', hostname);
  console.log('🔍 Subdomain:', subdomain);
  console.log('🔍 Pathname:', request.nextUrl.pathname);

  // Skip main domain (but allow subdomains on localhost)
  if (
    subdomain === 'www' ||
    hostname === 'hueline.com' ||
    hostname === 'localhost:3000'
  ) {
    return NextResponse.next();
  }

  // SUBDOMAIN ROUTING - COMMENTED OUT FOR NOW
  // const url = request.nextUrl.clone();
  // url.pathname = `/subdomains/${subdomain}${url.pathname}`;
  // console.log('🔍 REWRITING TO:', url.pathname);
  // return NextResponse.rewrite(url);

  // For now, just pass through all requests
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};