import { getCurrentTenantPrefix } from "./orgConfig";

const RESERVED_PORTAL_PREFIXES = ["/admin/", "/alumno/", "/profesor/"];

/**
 * Prefixes an internal href with the current tenant's /[portalName]/[tenant]
 * segment, so internal navigation stays bookmarkable regardless of whether
 * the current session was resolved via the legacy `?org=` flow or a
 * path-based tenant route (see docs/interschool-path-migration-plan.md).
 *
 * Leaves the href untouched when:
 *  - it isn't an absolute internal path (external URL, hash, mailto, etc.)
 *  - it's exactly "/" (the `?org=`-resolving root page)
 *  - it's already tenant-prefixed
 *  - there's no resolved tenant yet (SSR, or the org isn't known yet)
 */
export const withTenantPrefix = (href: string): string => {
  if (!href.startsWith("/") || href.startsWith("//") || href === "/") return href;
  if (RESERVED_PORTAL_PREFIXES.some((p) => href.startsWith(p))) return href;

  const prefix = getCurrentTenantPrefix();
  return prefix ? `${prefix}${href}` : href;
};
