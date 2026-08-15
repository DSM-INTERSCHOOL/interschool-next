"use client";

import { useEffect } from "react";
import { useSchoolStore } from "@/store/useSchoolStore";
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
 * component runs on every page and just copies them into localStorage once.
 */
export const TenantBridge = () => {
  const setSchoolInfo = useSchoolStore((s) => s.setSchoolInfo);

  useEffect(() => {
    const schoolId = readCookie(TENANT_BRIDGE_SCHOOL_ID_COOKIE);
    const portalName = readCookie(TENANT_BRIDGE_PORTAL_NAME_COOKIE);
    if (!schoolId || !portalName) return;

    localStorage.setItem("schoolId", schoolId);
    localStorage.setItem("portalName", portalName);

    const schoolInfo = schoolMap[schoolId];
    if (schoolInfo) {
      setSchoolInfo(schoolInfo.school_name, schoolInfo.school_image);
    }
  }, [setSchoolInfo]);

  return null;
};
