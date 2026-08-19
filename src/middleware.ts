import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resolveTenantRoute, decodeOrgParam, tenantPrefixFor } from '@/lib/orgConfig';
import { TENANT_BRIDGE_SCHOOL_ID_COOKIE, TENANT_BRIDGE_PORTAL_NAME_COOKIE } from '@/lib/tenantBridge';

// NOTE: auth is enforced client-side only (see components/ProtectedRoute.tsx),
// not here. An earlier version of this file also tried to gate on a
// `request.cookies.get('auth-storage')` cookie, but that cookie is never
// actually set anywhere — Zustand's `persist` middleware for useAuthStore
// writes to localStorage only (key "auth-storage", not a cookie). That
// check was silently dead code while this file lived at the wrong path
// (Next.js requires src/middleware.ts when using a src/ directory) and
// never ran; wiring it up surfaced an infinite redirect loop for any
// already-authenticated user (client says authenticated via localStorage,
// this file always disagreed since the cookie never exists). Removed
// rather than "fixed" — server-side auth gating never actually worked
// here, so removing it doesn't change real behavior, just stops the loop.

// Must match the catch-all destination in vercel.json's "rewrites".
const WORDPRESS_ORIGIN = 'https://interschoolmx.wpcomstaging.com';

const TENANT_PATH_RE = /^\/(admin|alumno|profesor)\/([^/]+)(\/.*)?$/;

/**
 * Path-based tenant routing (see docs/interschool-path-migration-plan.md).
 * Matches /[portalName]/[tenant]/... and resolves it to the same
 * { schoolId, portalName } the legacy `?org=` flow produces. Returns null
 * when the request isn't a tenant-prefixed path, or the portal/tenant
 * segments don't resolve — callers should fall back to legacy (`?org=`)
 * behavior in that case.
 */
function resolveTenantPrefix(pathname: string) {
  const match = pathname.match(TENANT_PATH_RE);
  if (!match) return null;

  const [, portalSegment, tenantSlug, rest] = match;
  const resolved = resolveTenantRoute(portalSegment, tenantSlug);
  if (!resolved) return null;

  return {
    prefix: `/${portalSegment}/${tenantSlug}`,
    logicalPathname: rest && rest !== '/' ? rest : null,
    ...resolved,
  };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`[middleware] ${request.method} ${pathname}${request.nextUrl.search}`);

  // The root path is the one place this Next.js app and the WordPress
  // marketing site collide: `/` is both this app's `?org=`-resolving entry
  // page AND, for organic/search traffic with no `org` param, meant to be
  // interschool.mx's homepage. vercel.json's catch-all rewrite to WordPress
  // can't win that collision — Vercel's routing table puts this app's own
  // `/` route ahead of vercel.json rewrites for framework (Next.js)
  // deployments — so handle both cases here, where the `org` check can
  // actually run before deciding.
  if (pathname === '/') {
    const orgParam = request.nextUrl.searchParams.get('org');

    if (orgParam) {
      // Legacy `?org=` entry point. Resolve it to a real HTTP redirect
      // instead of the client-side router.replace() this used to rely on
      // (page loads, decodes org in a useEffect, then soft-navigates) —
      // that meant no server-side redirect ever happened, so a bookmark of
      // this URL always re-ran the client resolution instead of landing
      // directly on the tenant-prefixed login page. `?org=` itself is
      // dropped since the target is built fresh with no carried-over
      // search params. Always targets /auth/login (not /notificaciones) —
      // same reasoning as the bare-tenant-root case below: auth state
      // isn't knowable server-side, so LoginRedirectHandler (client-side)
      // bounces an already-authenticated user on from there.
      const decoded = decodeOrgParam(orgParam);
      const prefix = decoded && tenantPrefixFor(decoded.schoolId, decoded.portalCode);
      console.log(`[middleware] root ?org= decode:`, { orgParam, decoded, prefix });
      if (prefix) {
        console.log(`[middleware] root ?org= -> 301 redirect to ${prefix}/auth/login`);
        return NextResponse.redirect(new URL(`${prefix}/auth/login`, request.url), 301);
      }
      // Decode/lookup failed — fall through to app/page.tsx, which still
      // renders the existing "Acceso no autorizado" error UI unchanged.
      console.log(`[middleware] root ?org= decode/lookup FAILED — falling through to app/page.tsx`);
    } else {
      console.log(`[middleware] root, no ?org= -> proxy to WordPress`);
      return NextResponse.rewrite(new URL('/', WORDPRESS_ORIGIN));
    }
  }

  const tenant = resolveTenantPrefix(pathname);
  if (!tenant) {
    console.log(`[middleware] "${pathname}" is not tenant-prefixed -> next()`);
    return NextResponse.next();
  }
  console.log(`[middleware] resolved tenant for "${pathname}":`, tenant);

  const withBridgeCookies = (response: NextResponse) => {
    console.log(`[middleware] setting bridge cookies: schoolId=${tenant.schoolId} portalName=${tenant.portalName}`);
    response.cookies.set(TENANT_BRIDGE_SCHOOL_ID_COOKIE, tenant.schoolId, { path: '/' });
    response.cookies.set(TENANT_BRIDGE_PORTAL_NAME_COOKIE, tenant.portalName, { path: '/' });
    return response;
  };

  // Bare tenant root, e.g. /admin/cfe (no trailing path). Auth state can
  // only be known client-side (see note above), so always land on the
  // tenant-prefixed login page; LoginRedirectHandler there bounces an
  // already-authenticated user on to /notificaciones itself.
  if (!tenant.logicalPathname) {
    const target = new URL(`${tenant.prefix}/auth/login`, request.url);
    console.log(`[middleware] bare tenant root -> redirect to ${target.pathname}`);
    return withBridgeCookies(NextResponse.redirect(target));
  }

  const rewritten = request.nextUrl.clone();
  rewritten.pathname = tenant.logicalPathname;
  console.log(`[middleware] rewriting "${pathname}" -> "${rewritten.pathname}"`);
  return withBridgeCookies(NextResponse.rewrite(rewritten));
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
