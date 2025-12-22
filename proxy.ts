import { NextResponse, NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  console.log('🔍 Hostname:', hostname);
  console.log('🔍 Pathname:', request.nextUrl.pathname);

  // Handle BOTH domains
  let currentHost = hostname;
  
  if (process.env.NODE_ENV === 'production') {
    // Try to remove both possible root domains
    if (hostname.includes('.hue-line.com')) {
      currentHost = hostname.replace('.hue-line.com', '');
    } else if (hostname.includes('.hueline.com')) {
      currentHost = hostname.replace('.hueline.com', '');
    }
  } else {
    currentHost = hostname.replace('.localhost:3000', '');
  }

  console.log('🔍 Current Host:', currentHost);

  // Check if it's the main domain (not a subdomain)
  if (
    currentHost === 'hue-line' ||
    currentHost === 'hueline' ||
    currentHost === 'www' ||
    currentHost === 'localhost:3000'
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/subdomains/${currentHost}${url.pathname}`;
  console.log('🔍 REWRITING TO:', url.pathname);
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};