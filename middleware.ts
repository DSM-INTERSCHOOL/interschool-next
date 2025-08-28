import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/landing',
  ];
  
  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Si es una ruta pública, permitir acceso
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Verificar si hay un token en las cookies
  const token = request.cookies.get('auth-storage')?.value;
  
  // Si no hay token y no es una ruta pública, redirigir al login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Si hay token, permitir acceso
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
