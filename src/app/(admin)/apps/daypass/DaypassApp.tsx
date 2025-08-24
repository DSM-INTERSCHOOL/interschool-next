"use client";

import { useState, useEffect } from "react";
import { 
    ClockIcon, 
    ExclamationTriangleIcon,
    ArrowPathIcon
} from "@heroicons/react/24/outline";
import { getDaypassAuthorizers, authorizeDaypass } from "@/services/daypass.service";
import { IDaypass } from "@/interfaces/IDaypass";
import DaypassCard from "./components/DaypassCard";

const DaypassApp = () => {
    const [daypasses, setDaypasses] = useState<IDaypass[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [authorizing, setAuthorizing] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedAuthorizers, setSelectedAuthorizers] = useState<Record<string, string>>({});

    // Configuración temporal - estos valores deberían venir del contexto de la aplicación
    const schoolId = "1"; // ID de la escuela actual
    const authorizerPersonId = "1"; // ID del usuario autorizador actual - esto debería venir del contexto

    useEffect(() => {
        loadDaypasses();
    }, []);

    const loadDaypasses = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getDaypassAuthorizers({
                schoolId,
                authorizerPersonId,
                status: "pendiente"
            });
            setDaypasses(data);
        } catch (err) {
            console.error("Error loading daypasses:", err);
            setError("Error al cargar los pases de salida");
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadDaypasses();
        setRefreshing(false);
    };

    const handleAuthorize = async (daypassId: string, authorizerPersonId: string) => {
        try {
            setAuthorizing(daypassId);
            const dto = {
                authorized: true,
                authorized_at: new Date().toISOString()
            };

            await authorizeDaypass({
                schoolId,
                daypassId,
                authorizerPersonId,
                dto
            });

            // Recargar la lista después de autorizar
            await loadDaypasses();
            // Limpiar la selección después de autorizar
            setSelectedAuthorizers(prev => {
                const newState = { ...prev };
                delete newState[daypassId];
                return newState;
            });
        } catch (err) {
            console.error("Error authorizing daypass:", err);
            setError("Error al autorizar el pase de salida");
        } finally {
            setAuthorizing(null);
        }
    };

    const handleAuthorizerSelect = (daypassId: string, authorizerId: string) => {
        setSelectedAuthorizers(prev => ({
            ...prev,
            [daypassId]: authorizerId
        }));
    };



    if (loading) {
        return (
            <div className="bg-base-100 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-center">
                    <div className="loading loading-spinner loading-lg"></div>
                    <span className="ml-3">Cargando pases de salida...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-base-100 rounded-lg shadow-sm p-6">
                <div className="alert alert-error">
                    <ExclamationTriangleIcon className="w-6 h-6" />
                    <span>{error}</span>
                    <button 
                        onClick={loadDaypasses}
                        className="btn btn-sm btn-outline"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-base-100 rounded-lg shadow-sm">
            <div className="p-6 border-b border-base-300">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-base-content">
                            Pases de Salida Pendientes
                        </h2>
                        <p className="text-base-content/70 mt-2">
                            Revisa y autoriza las solicitudes de salida de alumnos
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="btn btn-outline btn-sm"
                    >
                        {refreshing ? (
                            <>
                                <div className="loading loading-spinner loading-xs"></div>
                                Actualizando...
                            </>
                        ) : (
                            <>
                                <ArrowPathIcon className="w-4 h-4" />
                                Actualizar
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="p-6">
                {daypasses.length === 0 ? (
                    <div className="text-center py-12">
                        <ClockIcon className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-base-content mb-2">
                            No hay pases de salida pendientes
                        </h3>
                        <p className="text-base-content/70">
                            No tienes solicitudes de pases de salida que requieran tu autorización.
                        </p>
                    </div>
                ) : (
                                         <div className="space-y-6">
                         {daypasses.map((daypass) => (
                             <DaypassCard
                                 key={daypass.id}
                                 daypass={daypass}
                                 onAuthorize={handleAuthorize}
                                 authorizing={authorizing === daypass.id.toString()}
                                 selectedAuthorizerId={selectedAuthorizers[daypass.id.toString()] || null}
                                 onAuthorizerSelect={(authorizerId) => handleAuthorizerSelect(daypass.id.toString(), authorizerId)}
                             />
                         ))}
                     </div>
                )}
            </div>
        </div>
    );
};

export default DaypassApp;
