import { NextResponse, NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  
  console.log('🔍 Hostname:', hostname);
  console.log('🔍 Pathname:', pathname);

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

  // ✅ EXCLUDE paths that should NOT be rewritten for subdomains
  const excludedPaths = ['/login', '/signup', '/register', '/auth'];
  const shouldExclude = excludedPaths.some(path => pathname.startsWith(path));
  
  if (shouldExclude) {
    console.log('🔍 EXCLUDED PATH - Not rewriting:', pathname);
    return NextResponse.next();
  }

  // Only rewrite if it's a subdomain AND not an excluded path
  const url = request.nextUrl.clone();
  url.pathname = `/subdomains/${currentHost}${url.pathname}`;
  console.log('🔍 REWRITING TO:', url.pathname);
  
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};