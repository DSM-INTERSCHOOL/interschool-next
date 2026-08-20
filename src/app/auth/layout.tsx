import { type ReactNode } from "react";
import { AuthLayoutClient } from "./AuthLayoutClient";

// Forces every /auth/* page to render fresh per request instead of being
// statically optimized at build time. Next.js only recognizes this export
// from a Server Component file — AuthLayoutClient has "use client" and
// can't declare it itself, hence this thin server wrapper. Without it, a
// production build (unlike `next dev`, which always renders per-request)
// prerenders these pages once at build time with no real URL context,
// baking in a generic "Portal" fallback — then the SAME static HTML gets
// served for every tenant middleware rewrites here, guaranteeing a
// hydration mismatch against the real tenant useCurrentTenant() computes
// client-side from the actual URL (confirmed: bug was unreproducible in
// `next dev`, only on Vercel — and `next build` kept marking /auth/login
// "○ Static" even after force-dynamic was added directly to the old
// "use client" layout.tsx, which is what led to this split).
export const dynamic = 'force-dynamic';

const AuthLayout = ({ children }: { children: ReactNode }) => (
    <AuthLayoutClient>{children}</AuthLayoutClient>
);

export default AuthLayout;
