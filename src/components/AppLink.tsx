"use client";

import NextLink from "next/link";
import { forwardRef } from "react";
import type { ComponentProps } from "react";
import { withTenantPrefix } from "@/lib/tenantPath";

type Props = ComponentProps<typeof NextLink>;

/**
 * Drop-in replacement for next/link's default export — same props, same
 * behavior — that additionally prefixes string `href`s with the current
 * tenant's /[portalName]/[tenant] segment (see lib/tenantPath.ts). Swapped
 * in app-wide via `import { AppLink as Link } from "@/components/AppLink"`
 * so no call site needs to change.
 */
export const AppLink = forwardRef<HTMLAnchorElement, Props>(function AppLink(
  { href, ...rest },
  ref
) {
  const resolvedHref = typeof href === "string" ? withTenantPrefix(href) : href;
  return <NextLink ref={ref} href={resolvedHref} {...rest} />;
});
