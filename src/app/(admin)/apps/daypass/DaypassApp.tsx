"use client";

import { useState, useCallback, useEffect } from "react";
import { getDaypassAuthorizers, authorizeDaypass } from "@/services/daypass.service";
import { IDaypassAuthorizer } from "@/interfaces/IDaypass";
import { useAuthStore } from "@/store/useAuthStore";
import DaypassCard from "./components/DaypassCard";
import Toast from "@/components/Toast";

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

const DaypassApp = () => {
  const [daypassGroups, setDaypassGroups] = useState<IDaypassAuthorizer[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorizing, setAuthorizing] = useState<string | null>(null);
  const [selectedAuthorizers, setSelectedAuthorizers] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const schoolId = useAuthStore((state) => state.schoolId);
  const personId = useAuthStore((state) => state.personId);

  const addToast = (message: string, type: "success" | "error" | "warning" | "info") => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const loadDaypasses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDaypassAuthorizers({
        schoolId: schoolId?.toString()!,
        authorizerPersonId: personId?.toString()!,
        status: "pendiente"
      });
      setDaypassGroups(data);
    } catch (err: any) {
      console.error("Error loading daypasses:", err);
      setError(err.message || "Error al cargar los pases de salida.");
    } finally {
      setLoading(false);
    }
  }, [schoolId, personId]);

  useEffect(() => {
    loadDaypasses();
  }, [loadDaypasses]);

  const handleAuthorize = async (daypassId: string, authorizerPersonId: string, selectedOption: string) => {
    setAuthorizing(daypassId);
    try {
      // Obtener el daypass y la secuencia actual
      const daypassGroup = daypassGroups.find(group => 
        group.some(auth => auth.daypass.id.toString() === daypassId)
      );
      
      if (!daypassGroup) {
        throw new Error('Pase de salida no encontrado');
      }

      const daypassAuth = daypassGroup.find(auth => auth.daypass.id.toString() === daypassId);
      if (!daypassAuth) {
        throw new Error('Autorización no encontrada');
      }

      const currentSequence = daypassAuth.authorization_sequence;
      const currentSchoolId = schoolId || 1000;
      const currentPersonId = personId || 8121;

      await authorizeDaypass(
        parseInt(daypassId),
        currentPersonId,
        currentSequence,
        selectedOption,
        currentSchoolId
      );

      addToast("Pase de salida autorizado exitosamente", "success");
      await loadDaypasses();
      setSelectedAuthorizers(prev => {
        const newState = { ...prev };
        delete newState[daypassId];
        return newState;
      });
    } catch (error: any) {
      console.error("Error al autorizar:", error);
      addToast(`Error al autorizar: ${error.message || 'Error desconocido'}`, "error");
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

  const handleRetry = () => {
    loadDaypasses();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-3">Cargando pases de salida...</span>
      </div>
    );
  }

  if (error) {
    const isJsonError = error.includes('\n') || error.includes('{') || error.includes('[');
    
    return (
      <div className="space-y-4">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h3 className="font-bold">Error al cargar los pases de salida</h3>
            <div className="text-sm">
              {isJsonError ? (
                <pre className="whitespace-pre-wrap text-xs bg-base-200 p-2 rounded mt-2 overflow-x-auto">
                  {error}
                </pre>
              ) : (
                error
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button 
            onClick={handleRetry}
            className="btn btn-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (daypassGroups.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-base-content/50 text-lg mb-2">
          No hay pases de salida pendientes
        </div>
        <p className="text-base-content/40">
          Todos los pases de salida han sido procesados o no hay solicitudes pendientes.
        </p>
        <button 
          onClick={handleRetry}
          className="btn btn-outline btn-sm mt-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {daypassGroups.map((authorizations, groupIndex) => {
          const firstAuth = authorizations[0];
          const daypass = firstAuth.daypass;
          
          return (
            <DaypassCard
              key={`${daypass.id}-${groupIndex}`}
              daypass={daypass}
              authorizations={authorizations}
              onAuthorize={handleAuthorize}
              authorizing={authorizing === daypass.id.toString()}
              selectedAuthorizerId={selectedAuthorizers[daypass.id.toString()] || null}
              onAuthorizerSelect={(authorizerId) => handleAuthorizerSelect(daypass.id.toString(), authorizerId)}
            />
          );
        })}
      </div>

      {/* Toasts */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
};

export default DaypassApp;
