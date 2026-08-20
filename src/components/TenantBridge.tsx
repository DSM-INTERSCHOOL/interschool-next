"use client";

import { useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { useSchoolStore } from "@/store/useSchoolStore";
import { useAuthStore } from "@/store/useAuthStore";
import { schoolMap } from "@/lib/orgConfig";
import { TENANT_BRIDGE_SCHOOL_ID_COOKIE, TENANT_BRIDGE_PORTAL_NAME_COOKIE } from "@/lib/tenantBridge";

const readCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

/**
 * Bridges path-based tenant routing (/[portal]/[tenant]/...) into the same
 * localStorage keys the legacy `?org=` flow (app/page.tsx) writes, so every
 * existing service that reads getOrgConfig() keeps working unchanged
 * regardless of which flow resolved the tenant. Middleware sets the cookies
 * below when it resolves a /admin|alumno|profesor/:tenant/* request; this
 * component runs on every page and just copies them into localStorage.
 *
 * Uses useLayoutEffect (not useEffect) on purpose: useSchoolStore persists
 * to localStorage via Zustand's `persist`, and that rehydrates synchronously
 * from whatever tenant was active last — so on the very first render after
 * switching tenants (rewriting the URL to a different /portal/tenant), the
 * store still briefly holds the PREVIOUS tenant's name/logo. A plain effect
 * fires after paint, so that stale badge would flash on screen for a frame
 * before snapping to the correct one; useLayoutEffect corrects it before
 * the browser paints, so the stale value is never actually shown.
 *
 * Also calls router.refresh() whenever the resolved schoolId OR portalName
 * actually changes from what localStorage had before this run — portalName
 * changes on its own when only the portal (admin/alumno/profesor) changes
 * but the school stays the same. Some pages under
 * /[portal]/[tenant]/... have no server-side dynamic requirements (no
 * cookies()/headers() use, searchParams read only client-side behind
 * Suspense), which makes them eligible for Next.js's Full Route Cache —
 * i.e. the same cached HTML/RSC payload can be reused for every request
 * that middleware rewrites to that same logical path, regardless of which
 * tenant prefix it came from. router.refresh() discards any such cached
 * payload for the current route and forces a fresh render, which is the
 * fix for the specific symptom of "shows the previous tenant's info once,
 * but loading the same URL again shows it correctly".
 *
 * Also clears the auth session (useAuthStore) whenever the tenant changes
 * — same trigger as tenantChanged above (school OR portal changing counts:
 * a token from the "profesor" portal shouldn't be treated as valid on the
 * "alumno" portal for the same school either). This is the actual "stuck
 * on the previous portal" bug: useAuthStore persists a token/personId/
 * schoolId from whoever last logged in, and isAuthenticated() only checks
 * token+personId — it has no idea that token belongs to a *different*
 * school/portal. Land on a new tenant's /auth/login without this and
 * LoginRedirectHandler sees isAuthenticated still true from the old
 * session and immediately bounces you to /notificaciones using the old
 * (wrong-tenant) token, before you ever see a login form for the new one
 * — from there everything is broken (wrong or failing API calls) until
 * something wipes the stale token, e.g. fully closing the browser if it's
 * set to clear storage on exit.
 */
export const TenantBridge = () => {
  const setSchoolInfo = useSchoolStore((s) => s.setSchoolInfo);
  const authLogout = useAuthStore((s) => s.logout);
  const router = useRouter();

  useLayoutEffect(() => {
    const schoolId = readCookie(TENANT_BRIDGE_SCHOOL_ID_COOKIE);
    const portalName = readCookie(TENANT_BRIDGE_PORTAL_NAME_COOKIE);
    if (!schoolId || !portalName) return;

    const previousSchoolId = localStorage.getItem("schoolId");
    const previousPortalName = localStorage.getItem("portalName");
    const authBefore = useAuthStore.getState();

    localStorage.setItem("schoolId", schoolId);
    localStorage.setItem("portalName", portalName);

    const schoolInfo = schoolMap[schoolId];
    if (schoolInfo) {
      setSchoolInfo(schoolInfo.school_name, schoolInfo.school_image);
    }

    const tenantChanged =
      (previousSchoolId && previousSchoolId !== schoolId) ||
      (previousPortalName && previousPortalName !== portalName);

    if (tenantChanged) {
      // Stale session from a different school/portal — drop it so the new
      // tenant's login page actually asks the user to log in, instead of
      // silently reusing (or getting redirected away by) old credentials.
      if (authBefore.token) {
        authLogout();
      }
      router.refresh();
    }
  }, [setSchoolInfo, authLogout, router]);

  return null;
};
