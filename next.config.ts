import type { NextConfig } from "next";

// Must match middleware.ts's WORDPRESS_ORIGIN.
const WORDPRESS_ORIGIN = "https://interschoolmx.wpcomstaging.com";

const nextConfig: NextConfig = {
  eslint: {
    // Evita que ESLint falle el build en Vercel y local
    ignoreDuringBuilds: true,
  },
  typescript: {
    // OPCIONAL: permite compilar aunque existan errores de tipos
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      // `fallback` only runs when nothing in this Next.js app matched the
      // request (no page, no dynamic route, no afterFiles rewrite) — see
      // https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites.
      // This is what makes it safe: every existing app route (/apps/*,
      // /home, /notificaciones, /admin/<tenant>/*, etc.) is tried first
      // and keeps working; only genuinely unknown paths (real WordPress
      // marketing content) fall through to the proxy. vercel.json used to
      // do this via a blind catch-all rewrite instead, which intercepted
      // this app's own routes outside /admin|alumno|profesor (e.g.
      // /apps/publications/[id]) before Next.js's router ever got a
      // chance to serve them — moved here on purpose.
      fallback: [
        {
          source: "/:path*",
          destination: `${WORDPRESS_ORIGIN}/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
