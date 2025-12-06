import { NextResponse, NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  console.log('🔍 Hostname:', hostname);
  console.log('🔍 Pathname:', request.nextUrl.pathname);

  const currentHost =
    process.env.NODE_ENV === 'production'
      ? hostname.replace('.hueline.com', '')
      : hostname.replace('.localhost:3000', '');

  console.log('🔍 Current Host:', currentHost);

  if (
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