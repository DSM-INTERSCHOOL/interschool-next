"use client";

import { AppLink as Link } from "@/components/AppLink";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { OrderMode, ORDER_MODES } from "@/interfaces/ITopCategory";
import { useOrderModesConfig } from "./hooks";

// Full names for this table's column headers -- ORDER_MODES.label itself
// stays "AS"/"OP" since that's also used for a compact per-row badge in
// OrdersListPage.tsx, where the full word wouldn't fit.
const ORDER_MODE_TABLE_LABELS: Record<OrderMode, string> = {
  SELF_SERVICE: "Autoservicio",
  OPERATOR: "Operador",
};

export default function OrderModesConfigPage() {
  const { categories, enabled, loading, error, saving, saveError, dirty, toggle, save, discard } =
    useOrderModesConfig();

  return (
    <>
      <PageTitle
        title="Modos de Venta"
      />
      <div className="mt-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-base-content/60 text-sm mt-1">
                  Define qué categorías están disponibles para cada forma de levantar órdenes.
                  Una categoría sin marcar en un modo no aparece ahí -- por ejemplo, Uniformes
                  puede ofrecerse solo por Operador, no en autoservicio.
                </p>
              </div>
              <Link href="/apps/commerce/top-categories" className="btn btn-ghost btn-sm">
                <span className="iconify lucide--arrow-left size-4"></span>
                Volver
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner message="Cargando configuración..." />
              </div>
            ) : error ? (
              <div className="alert alert-error">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>{error}</div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-16">
                <span className="iconify lucide--layout-grid size-24 text-base-content/20 mb-4"></span>
                <h3 className="text-xl font-medium text-base-content mb-2">
                  Sin categorías
                </h3>
                <p className="text-base-content/60 mb-6">
                  Crea al menos una categoría para poder configurar sus modos de venta
                </p>
                <Link href="/apps/commerce/top-categories/create" className="btn btn-primary btn-sm">
                  <span className="iconify lucide--plus size-4"></span>
                  Nueva Categoría
                </Link>
              </div>
            ) : (
              <>
                {saveError && (
                  <div className="alert alert-error mb-4">
                    <span className="iconify lucide--alert-circle size-6"></span>
                    <div>{saveError}</div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Categoría</th>
                        {ORDER_MODES.map((mode) => (
                          <th key={mode.value} className="text-center">
                            {ORDER_MODE_TABLE_LABELS[mode.value]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category.id}>
                          <td>{category.description}</td>
                          {ORDER_MODES.map((mode) => (
                            <td key={mode.value} className="text-center">
                              <input
                                type="checkbox"
                                className="checkbox checkbox-primary"
                                checked={enabled[mode.value].has(category.id)}
                                onChange={() => toggle(mode.value, category.id)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={discard}
                    disabled={!dirty || saving}
                  >
                    Descartar cambios
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={save}
                    disabled={!dirty || saving}
                  >
                    {saving ? <span className="loading loading-spinner loading-sm"></span> : "Guardar cambios"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
