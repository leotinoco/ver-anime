import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

const protectedRoutes = ['/favoritos', '/perfil', '/admin', '/profile'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    const session = request.cookies.get('session')?.value;
    
    if (!session) {
      console.log(`[MIDDLEWARE] No session found for path: ${pathname}`);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await decrypt(session);

    if (!payload) {
      console.log(`[MIDDLEWARE] Failed to decrypt session for path: ${pathname}`);
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    console.log(`[MIDDLEWARE] Authorized access to: ${pathname} for user ${payload.username}`);
    
    // Check admin routes specifically
    if (pathname.startsWith('/admin') && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
