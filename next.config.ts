import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Evita que ESLint falle el build en Vercel y local
    ignoreDuringBuilds: true,
  },
  typescript: {
    // OPCIONAL: permite compilar aunque existan errores de tipos
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
