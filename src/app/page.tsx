"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useSchoolStore } from "@/store/useSchoolStore";
import { useHydration } from "@/hooks/useHydration";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { orgsMap, PortalCode, schoolMap } from "@/lib/orgConfig";

// Tipos para el mapeo de organizaciones



function RootPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isHydrated = useHydration();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
    const setSchoolInfo = useSchoolStore((state) => state.setSchoolInfo);
    const [hasError, setHasError] = useState(false);



    useEffect(() => {
        // Extraer y decodificar el query param 'org'
        const orgParam = searchParams.get('org');

        if (!orgParam) {
            // No hay parámetro org, mostrar error
            setHasError(true);
            return;
        }

        try {
            // Decodificar de base64
            const decodedValue = atob(decodeURIComponent(orgParam));
            const [schoolId, portalCode] = decodedValue.split("_");

            // Validar que existan los valores en el mapa
            if (schoolId in orgsMap && portalCode in orgsMap[schoolId]) {
                const portalName = orgsMap[schoolId][portalCode as PortalCode];

                // Guardar en localStorage
                localStorage.setItem('schoolId', schoolId);
                localStorage.setItem('portalName', portalName);

                // Obtener información de la escuela del schoolMap
                const schoolInfo = schoolMap[schoolId];
                if (schoolInfo) {
                    setSchoolInfo(schoolInfo.school_name, schoolInfo.school_image);
                }

                // Continuar con la lógica de redirección solo si está hidratado
                // y solo hacer el redirect una vez
                if (isHydrated) {
                    if (isAuthenticated) {
                        router.replace('/notificaciones');
                    } else {
                        router.replace('/auth/login');
                    }
                }
            } else {
                console.error('School ID or Portal Code not found in orgsMap');
                setHasError(true);
            }
        } catch (error) {
            console.error('Error decoding org param:', error);
            setHasError(true);
        }
    // Solo ejecutar una vez cuando se monta el componente y cuando isHydrated cambia
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isHydrated]);

    // Mostrar error si no hay parámetro org o es inválido
    if (hasError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-base-200">
                <div className="card w-96 bg-base-100 shadow-xl">
                    <div className="card-body items-center text-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16 text-error mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <h2 className="card-title text-error">Acceso no autorizado</h2>
                        <p className="text-base-content/70">
                            No se pudo verificar tu acceso. Por favor, intenta nuevamente desde el enlace oficial.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

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

export default function RootPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner
                    message="Cargando..."
                    size="lg"
                    fullScreen
                />
            </div>
        }>
            <RootPageContent />
        </Suspense>
    );
}
