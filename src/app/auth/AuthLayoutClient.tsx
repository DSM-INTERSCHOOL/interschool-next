"use client";

import { type ReactNode } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { useCurrentTenant } from "@/hooks/useCurrentTenant";

const PORTAL_HERO: Record<string, { image: string; name: string }> = {
    admin: { image: '/images/auth/auth-hero-admin.png', name: 'Portal Administración' },
    alumno: { image: '/images/auth/auth-hero-student.png', name: 'Portal Alumno' },
    profesor: { image: '/images/auth/auth-hero-teacher.png', name: 'Portal Profesor' },
};

export const AuthLayoutClient = ({ children }: { children: ReactNode }) => {
    // Same hydration-mismatch bug this used to have as auth/login/page.tsx
    // (see DESCRIPCION_BUG.txt / logslug.txt): getOrgConfig() reads
    // localStorage, which returns {} server-side but whatever the
    // *previous* tenant was on the client's first render (before
    // TenantBridge's layout effect corrects it) — SSR renders "Portal",
    // client renders e.g. "Portal Alumno" from the last visit, React
    // throws a hydration-mismatch error and the h1 can end up stuck on
    // the stale value. useCurrentTenant() derives straight from
    // usePathname(), which is identical on the server and the client for
    // the initial render — no mismatch possible.
    const currentTenant = useCurrentTenant();
    const config = getOrgConfig();

    // Determinar la imagen y el nombre según el tipo de portal
    const getPortalConfig = () => {
        if (currentTenant) {
            return PORTAL_HERO[currentTenant.portalSegment] ?? { image: '/images/auth/auth-hero.png', name: 'Portal' };
        }

        // Legacy `?org=` flow fallback — this page is only ever reached by
        // client-side navigation in that flow (never server-rendered with
        // org context), so there's no SSR/CSR mismatch risk here.
        const portalName = config.portalName?.toLowerCase() || '';

        if (portalName.includes('meta') || portalName.includes('mt')) {
            return {
                image: '/images/auth/auth-hero-admin.png',
                name: 'Portal Administración'
            };
        } else if (portalName.includes('alumno') || portalName.includes('al')) {
            return {
                image: '/images/auth/auth-hero-student.png',
                name: 'Portal Alumno'
            };
        } else if (portalName.includes('profesor') || portalName.includes('pr')) {
            return {
                image: '/images/auth/auth-hero-teacher.png',
                name: 'Portal Profesor'
            };
        }

        return {
            image: '/images/auth/auth-hero.png',
            name: config.portalName || 'Portal'
        };
    };

    const portalConfig = getPortalConfig();

    return (
        <div className="grid grid-cols-12 overflow-auto sm:h-screen">
            <div className="relative hidden bg-[#FFE9D1] lg:col-span-7 lg:block xl:col-span-8 2xl:col-span-9 dark:bg-[#14181c]">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-12">
                    <h1 className="text-3xl font-bold text-base-content">{portalConfig.name}</h1>
                    <img src={portalConfig.image} className="object-contain max-w-2xl max-h-[70vh]" alt="Auth Image" />
                </div>
            </div>
            <div className="col-span-12 lg:col-span-5 xl:col-span-4 2xl:col-span-3">
                {children}
            </div>
        </div>
    );
};
