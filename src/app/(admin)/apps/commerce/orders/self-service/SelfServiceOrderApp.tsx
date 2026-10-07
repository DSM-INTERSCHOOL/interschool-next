"use client";

import { useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuthStore } from "@/store/useAuthStore";
import { useCatalogForOrderMode } from "./hooks";
import { StartScreen, OrderingScreen } from "./components";

type View = "start" | "ordering";

export function SelfServiceOrderApp() {
  const [view, setView] = useState<View>("start");
  const { categories, products, colors, sizes, loading, error } = useCatalogForOrderMode("SELF_SERVICE");
  const personInternalId = useAuthStore((state) => state.personInternalId);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner message="Cargando..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span className="iconify lucide--alert-circle size-6"></span>
        <div>{error}</div>
      </div>
    );
  }

  if (view === "start") {
    return <StartScreen onStart={() => setView("ordering")} />;
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="iconify lucide--layout-grid size-16 text-base-content/40"></span>
        <h2 className="text-xl font-bold">Sin categorías disponibles</h2>
        <p className="max-w-md text-base-content/60">
          Ninguna categoría principal está habilitada para autoservicio todavía. Configúralas desde
          Categorías Principales.
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
      orderMode="SELF_SERVICE"
      onCancel={() => setView("start")}
    />
  );
}
