"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useHydration } from "@/hooks/useHydration";
import { LoadingSpinner } from "@/components/LoadingSpinner";

// Tipos para el mapeo de organizaciones
type PortalCode = "MT" | "ST" | "TC";
type PortalMap = Record<PortalCode, string>;
type OrgsMap = Record<string, PortalMap>;

function RootPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isHydrated = useHydration();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
    const [hasError, setHasError] = useState(false);

    const orgsMap: OrgsMap = {
        "1000": {
            "MT": "https://meta.celta.idsm.xyz",
            "ST": "https://alumno.celta.idsm.xyz",
            "TC": "https://profesor.celta.idsm.xyz"
        },
        "1001": {
            "MT": "https://meta.spongies.idsm.xyz",
            "ST": "https://alumno.spongies.idsm.xyz",
            "TC": "https://profesor.spongies.idsm.xyz"
        },
        "1002": {
            "MT": "https://meta.helenkeller.idsm.xyz",
            "ST": "https://alumno.helenkeller.idsm.xyz",
            "TC": "https://profesor.helenkeller.idsm.xyz"
        },
        "1003": {
            "MT": "https://meta.liceoannafreud.idsm.xyz",
            "ST": "https://alumno.liceoannafreud.idsm.xyz",
            "TC": "https://profesor.liceoannafreud.idsm.xyz"
        },
        "1004": {
            "MT": "https://meta.cfe.idsm.xyz",
            "ST": "https://alumno.cfe.idsm.xyz",
            "TC": "https://profesor.cfe.idsm.xyz"
        },
        "1005": {
            "MT": "https://meta.wch.idsm.xyz",
            "ST": "https://alumno.wch.idsm.xyz",
            "TC": "https://profesor.wch.idsm.xyz"
        },
        "1006": {
            "MT": "https://meta.cf.idsm.xyz",
            "ST": "https://alumno.cf.idsm.xyz",
            "TC": "https://profesor.cf.idsm.xyz"
        },
        "1007": {
            "MT": "https://meta.grupocudec.idsm.xyz",
            "ST": "https://alumno.grupocudec.idsm.xyz",
            "TC": "https://profesor.grupocudec.idsm.xyz"
        },
        "1008": {
            "MT": "https://meta.ipia.idsm.xyz",
            "ST": "https://alumno.ipia.idsm.xyz",
            "TC": "https://profesor.ipia.idsm.xyz"
        },
        "1009": {
            "MT": "https://meta.dali.idsm.xyz",
            "ST": "https://alumno.dali.idsm.xyz",
            "TC": "https://profesor.dali.idsm.xyz"
        },
        "1010": {
            "MT": "https://meta.vizcaino.idsm.xyz",
            "ST": "https://alumno.vizcaino.idsm.xyz",
            "TC": "https://profesor.vizcaino.idsm.xyz"
        },
        "1011": {
            "MT": "https://meta.chk-qro.idsm.xyz",
            "ST": "https://alumno.chk-qro.idsm.xyz",
            "TC": "https://profesor.chk-qro.idsm.xyz"
        },
        "1013": {
            "MT": "https://meta.montessori-pachuca.idsm.xyz",
            "ST": "https://alumno.montessori-pachuca.idsm.xyz",
            "TC": "https://profesor.montessori-pachuca.idsm.xyz"
        },
        "1014": {
            "MT": "https://meta.dicormo.idsm.xyz",
            "ST": "https://alumno.dicormo.idsm.xyz",
            "TC": "https://profesor.dicormo.idsm.xyz"
        },
        "1015": {
            "MT": "https://meta.uc.idsm.xyz",
            "ST": "https://alumno.uc.idsm.xyz",
            "TC": "https://profesor.uc.idsm.xyz"
        },
        "1016": {
            "MT": "https://meta.iamb.idsm.xyz",
            "ST": "https://alumno.iamb.idsm.xyz",
            "TC": "https://profesor.iamb.idsm.xyz"
        },
        "1017": {
            "MT": "https://meta.ccolumbia.idsm.xyz",
            "ST": "https://alumno.ccolumbia.idsm.xyz",
            "TC": "https://profesor.ccolumbia.idsm.xyz"
        },
        "1018": {
            "MT": "https://meta.plata.idsm.xyz",
            "ST": "https://alumno.plata.idsm.xyz",
            "TC": "https://profesor.plata.idsm.xyz"
        },
        "1019": {
            "MT": "https://meta.nitamani.idsm.xyz",
            "ST": "https://alumno.nitamani.idsm.xyz",
            "TC": "https://profesor.nitamani.idsm.xyz"
        }
    }

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

                // Continuar con la lógica de redirección solo si está hidratado
                // y solo hacer el redirect una vez
                if (isHydrated) {
                    if (isAuthenticated) {
                        router.replace('/home');
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
