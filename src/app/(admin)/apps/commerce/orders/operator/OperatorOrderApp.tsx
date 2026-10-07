"use client";

import { useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CommercePersonRead } from "@/interfaces/ICommercePerson";
import { useCatalogForOrderMode } from "../shared/hooks";
import { OrderingScreen } from "../shared/components";
import { ClientSearchScreen, fullName } from "./components/ClientSearchScreen";

type View = "client-search" | "ordering";

export function OperatorOrderApp() {
  const [view, setView] = useState<View>("client-search");
  const [client, setClient] = useState<CommercePersonRead | null>(null);
  const { categories, products, colors, sizes, loading, error } = useCatalogForOrderMode("OPERATOR");

  const startOrdering = (selected: CommercePersonRead | null) => {
    setClient(selected);
    setView("ordering");
  };

  const backToClientSearch = () => {
    setClient(null);
    setView("client-search");
  };

  if (loading) {
    return <LoadingSpinner message="Cargando catálogo..." />;
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span className="iconify lucide--alert-circle size-6"></span>
        <div>{error}</div>
      </div>
    );
  }

  if (view === "client-search") {
    return <ClientSearchScreen onSelect={(c) => startOrdering(c)} onSkip={() => startOrdering(null)} />;
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="iconify lucide--layout-grid size-16 text-base-content/40"></span>
        <h2 className="text-xl font-bold">Sin categorías disponibles</h2>
        <p className="max-w-md text-base-content/60">
          Ninguna categoría principal está habilitada para venta por operador todavía. Configúralas
          desde Categorías Principales.
        </p>
        <button type="button" onClick={backToClientSearch} className="btn btn-outline mt-2">
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
      clientPersonInternalId={client?.person_internal_id}
      clientLabel={client ? fullName(client) : undefined}
      orderMode="OPERATOR"
      onCancel={backToClientSearch}
    />
  );
}
