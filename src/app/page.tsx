"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useHydration } from "@/hooks/useHydration";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function RootPage() {
    const router = useRouter();
    const isHydrated = useHydration();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

    useEffect(() => {
        // Solo hacer redirect después de la hidratación
        if (isHydrated) {
            if (isAuthenticated) {
                // Si está autenticado, redirigir a home
                router.push('/home');
            } else {
                // Si no está autenticado, redirigir a login
                router.push('/auth/login');
            }
        }
    }, [isHydrated, isAuthenticated, router]);

    // Mostrar loading mientras se determina el estado de autenticación
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner 
                message="Cargando..." 
                size="lg" 
                fullScreen 
            />
        </div>
    );
}
