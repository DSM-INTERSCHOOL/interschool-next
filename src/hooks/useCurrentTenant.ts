"use client";

import { usePathname } from "next/navigation";
import { resolveTenantRoute, PortalName } from "@/lib/orgConfig";

// Must match middleware.ts's TENANT_PATH_RE.
const TENANT_PATH_RE = /^\/(admin|alumno|profesor)\/([^/]+)(?:\/|$)/;

export interface CurrentTenant {
  portalSegment: PortalName;
  tenantSlug: string;
  schoolId: string;
  /** Origin URL for this school+portal (used as the x-url-origin header), e.g. https://mt.cfe.interschool.mx */
  portalName: string;
}

/**
 * Derives the active tenant directly and synchronously from the current
 * URL path (via usePathname()) — no cookies, no localStorage, no effects.
 *
 * Why this exists: TenantBridge (cookie -> localStorage -> useSchoolStore)
 * involves several async/effect-timing hops, and switching between two
 * /[portal]/[tenant]/... URLs was observed to intermittently show the
 * previous portal's info depending on exactly how those hops interleave.
 * The URL itself is available synchronously on every render with zero
 * ambiguity, so for anything that only needs to *display* which tenant is
 * active (e.g. the login page's portal label), prefer this over
 * getOrgConfig() — it can't race with anything because there's nothing
 * async involved.
 *
 * Relies on NextResponse.rewrite() being transparent to the browser:
 * usePathname() reflects the original tenant-prefixed URL the user is
 * looking at, not the internal rewritten (unprefixed) destination.
 *
 * Returns null when the current URL isn't tenant-prefixed (legacy `?org=`
 * flow, or the portal/tenant segments don't resolve) — callers should fall
 * back to getOrgConfig() in that case.
 */
export const useCurrentTenant = (): CurrentTenant | null => {
  const pathname = usePathname();
  const match = pathname.match(TENANT_PATH_RE);
  if (!match) return null;

  const [, portalSegment, tenantSlug] = match;
  const resolved = resolveTenantRoute(portalSegment, tenantSlug);
  if (!resolved) return null;

  return { portalSegment: portalSegment as PortalName, tenantSlug, ...resolved };
};
