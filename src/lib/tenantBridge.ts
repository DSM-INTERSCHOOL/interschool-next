// Cookie names used to hand off tenant identity resolved by middleware.ts
// (from a /[portalName]/[tenant]/... path) to the client-side TenantBridge
// component, which copies them into the same localStorage keys the legacy
// `?org=` flow (app/page.tsx) uses. Kept in one place since both the root
// middleware.ts and the client component need the exact same names.
export const TENANT_BRIDGE_SCHOOL_ID_COOKIE = "x-tenant-school-id";
export const TENANT_BRIDGE_PORTAL_NAME_COOKIE = "x-tenant-portal-name";
