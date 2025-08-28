"use client";

import type { Metadata } from "next";
import Link from "next/link";
import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';

import { Logo } from "@/components/Logo";
import { ThemeToggleDropdown } from "@/components/ThemeToggleDropdown";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from '@/hooks/useAuth';
import { useHydration } from '@/hooks/useHydration';

import { LoginAuth } from "./LoginAuth";

const LoginRedirectHandler = () => {
    const { isAuthenticated } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isHydrated = useHydration();

    useEffect(() => {
        // Solo redirigir después de la hidratación
        if (isHydrated && isAuthenticated) {
            const redirectTo = searchParams.get('redirectTo') || '/dashboards/ecommerce';
            router.push(redirectTo);
        }
    }, [isHydrated, isAuthenticated, router, searchParams]);

    return null; // Este componente no renderiza nada
};

const LoginPageContent = () => {
    const { isAuthenticated } = useAuth();
    const isHydrated = useHydration();

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
                    <Logo />
                </div>
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-base-content">
                    Iniciar Sesión
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
            <Suspense fallback={<LoadingSpinner fullScreen />}>
                <LoginRedirectHandler />
            </Suspense>
            <LoginPageContent />
        </>
    );
};

export default LoginPage;
