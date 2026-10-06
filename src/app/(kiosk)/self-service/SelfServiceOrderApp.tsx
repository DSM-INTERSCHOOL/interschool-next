"use client";

import { useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuthStore } from "@/store/useAuthStore";
import { useCatalogForOrderMode } from "./hooks";
import { StartScreen, OrderingScreen } from "./components";

type View = "start" | "ordering";

export function SelfServiceOrderApp() {
  const [view, setView] = useState<View>("start");
  const { schoolId, categories, products, colors, sizes, loading, error } =
    useCatalogForOrderMode("SELF_SERVICE");
  const personInternalId = useAuthStore((state) => state.personInternalId);

  if (loading) {
    return <LoadingSpinner fullScreen message="Cargando..." />;
  }

  if (!schoolId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <span className="iconify lucide--monitor-off size-16 text-base-content/40"></span>
        <h1 className="text-2xl font-bold">Dispositivo no configurado</h1>
        <p className="max-w-md text-base-content/60">
          Este equipo necesita iniciar sesión una vez desde el panel de administración antes de
          poder usarse como terminal de autoservicio.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <span className="iconify lucide--alert-circle size-16 text-error"></span>
        <h1 className="text-2xl font-bold">No se pudo cargar el catálogo</h1>
        <p className="max-w-md text-base-content/60">{error}</p>
      </div>
    );
  }

  if (view === "start") {
    return <StartScreen onStart={() => setView("ordering")} />;
  }

  if (categories.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <span className="iconify lucide--layout-grid size-16 text-base-content/40"></span>
        <h1 className="text-2xl font-bold">Sin categorías disponibles</h1>
        <p className="max-w-md text-base-content/60">
          Ninguna categoría principal está habilitada para autoservicio todavía. Configúralas desde
          Categorías Principales en el panel de administración.
        </p>
        <button type="button" onClick={() => setView("start")} className="btn btn-outline mt-2">
          Volver
        </button>
      </div>
    );
  }

  return (
    <OrderingScreen
      categories={categories}
      products={products}
      colors={colors}
      sizes={sizes}
      // Self-service: the logged-in person is both who's placing the
      // order and who it's for -- see the shared useCheckout hook's own
      // note on why this is a deliberate choice, not a backend default.
      clientPersonInternalId={personInternalId ?? undefined}
      onCancel={() => setView("start")}
    />
  );
}
