"use client";

import type { Metadata } from "next";
import { AppLink as Link } from "@/components/AppLink";
import React, { useEffect, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';

import { ThemeToggleDropdown } from "@/components/ThemeToggleDropdown";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from '@/hooks/useAuth';
import { useHydration } from '@/hooks/useHydration';
import { SchoolBadge } from "@/components/SchoolBadge";

import { LoginAuth } from "./LoginAuth";
import { getOrgConfig, schoolMap } from "@/lib/orgConfig";
import { useCurrentTenant } from "@/hooks/useCurrentTenant";

const LoginRedirectHandler = () => {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isHydrated = useHydration();
    

    useEffect(() => {
        // Solo redirigir después de la hidratación
        if (isHydrated && isAuthenticated) {
            const redirectTo = searchParams.get('redirectTo') || '/notificaciones';
            router.push(redirectTo);
        }
    }, [isHydrated, isAuthenticated, router, searchParams]);

    return null; // Este componente no renderiza nada
};

const PORTAL_LABEL: Record<string, string> = {
    admin: 'Portal Administración',
    alumno: 'Portal Alumno',
    profesor: 'Portal Profesor',
};

const LoginPageContent = () => {
    const { isAuthenticated } = useAuth();
    const isHydrated = useHydration();
    // Prefer deriving straight from the URL (see useCurrentTenant) — it's
    // synchronous and can't race with anything, unlike getOrgConfig(),
    // which depends on TenantBridge's cookie -> localStorage bridge having
    // already run and "won" against whatever was persisted from the
    // previous tenant. Falls back to getOrgConfig() only for the legacy
    // `?org=` flow, where there's no tenant-prefixed URL to read from.
    const currentTenant = useCurrentTenant();
    const config = getOrgConfig();

    const schoolInfo = currentTenant ? schoolMap[currentTenant.schoolId] : null;
    const schoolName = schoolInfo?.school_name;
    const schoolImage = schoolInfo?.school_image;

    const portalName = currentTenant
        ? PORTAL_LABEL[currentTenant.portalSegment] ?? 'Portal'
        : (() => {
            const lower = config.portalName?.toLowerCase() || '';
            if (lower.includes('meta') || lower.includes('mt')) return 'Portal Administración';
            if (lower.includes('alumno') || lower.includes('al')) return 'Portal Alumno';
            if (lower.includes('profesor') || lower.includes('pr')) return 'Portal Profesor';
            return config.portalName || 'Portal';
        })();

    // Durante la hidratación, mostrar un estado de carga
    if (!isHydrated) {
        return <LoadingSpinner fullScreen />;
    }

    // Si está autenticado, mostrar estado de carga mientras redirige
    if (isAuthenticated) {
        return <LoadingSpinner message="Redirigiendo..." fullScreen />;
    }

    return (
        <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">

                <div className="flex items-center justify-center">
                    <SchoolBadge variant="mobile" schoolName={schoolName} schoolImage={schoolImage} />
                </div>
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-base-content">
                    Iniciar Sesión
                    <div className="text-sm font-normal mt-2 opacity-70 lg:hidden">{portalName}</div>
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <LoginAuth />
            </div>

            <div className="absolute top-4 right-4">
                <ThemeToggleDropdown />
            </div>
        </div>
    );
};

const LoginPage = () => {
    return (
        <>
            <title>Iniciar Sesión</title>
            <Suspense fallback={<LoadingSpinner fullScreen />}>
                <LoginRedirectHandler />
            </Suspense>
            <LoginPageContent />
        </>
    );
};

export default LoginPage;
