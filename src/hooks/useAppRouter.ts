"use client";

import { useRouter as useNextRouter } from "next/navigation";
import type { NavigateOptions, PrefetchOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { withTenantPrefix } from "@/lib/tenantPath";

/**
 * Drop-in replacement for next/navigation's useRouter — same API — that
 * additionally prefixes string hrefs passed to push/replace with the
 * current tenant's /[portalName]/[tenant] segment (see lib/tenantPath.ts).
 * Swapped in app-wide via
 * `import { useAppRouter as useRouter } from "@/hooks/useAppRouter"`
 * so call sites (`router.push("/home")`, etc.) don't need to change.
 */
export const useAppRouter = () => {
  const router = useNextRouter();

  return {
    ...router,
    push: (href: string, options?: NavigateOptions) => router.push(withTenantPrefix(href), options),
    replace: (href: string, options?: NavigateOptions) => router.replace(withTenantPrefix(href), options),
    prefetch: (href: string, options?: PrefetchOptions) => router.prefetch(withTenantPrefix(href), options),
  };
};
