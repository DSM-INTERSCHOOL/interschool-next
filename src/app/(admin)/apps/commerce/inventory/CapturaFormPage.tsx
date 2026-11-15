"use client";

import { AppLink as Link } from "@/components/AppLink";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useCapturaForm } from "./hooks";

export default function CapturaFormPage() {
  const {
    catalogs,
    topCategories,
    topCategoriesLoading,
    topCategoriesError,
    warehouseId,
    setWarehouseId,
    topCategoryId,
    setTopCategoryId,
    notes,
    setNotes,
    rows,
    countFor,
    setCount,
    saveLoading,
    saveError,
    handleSave,
  } = useCapturaForm();

  const colorDescription = (id: number | null) =>
    id === null ? "—" : catalogs.colors.find((c) => c.id === id)?.description ?? `#${id}`;
  const sizeDescription = (id: number | null) =>
    id === null ? "—" : catalogs.sizes.find((s) => s.id === id)?.description ?? `#${id}`;

  const loading = catalogs.loading || topCategoriesLoading;
  const ready = warehouseId !== "" && topCategoryId !== "";

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <p className="text-base-content/60 text-sm mb-4">
          Selecciona un almacén y una categoría para capturar el conteo físico de todo su catálogo de
          productos inventariables. La cantidad contada se convierte en la existencia de cada
          artículo -- solo se registra un movimiento de kardex por la diferencia contra lo que había
          registrado (entrada si el conteo es mayor, salida si es menor); si coincide, no se genera
          ningún movimiento.
        </p>

        {(saveError || catalogs.error || topCategoriesError) && (
          <div className="alert alert-error mb-4">
            <span className="iconify lucide--alert-circle size-6"></span>
            <div>{saveError || catalogs.error || topCategoriesError}</div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 mb-4 max-w-2xl sm:grid-cols-2">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Almacén</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">Selecciona un almacén</option>
              {catalogs.warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.description}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Categoría</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={topCategoryId}
              onChange={(e) => setTopCategoryId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">Selecciona una categoría</option>
              {topCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner message="Cargando catálogos..." />
          </div>
        ) : !ready ? (
          <div className="text-center py-16">
            <span className="iconify lucide--clipboard-list size-24 text-base-content/20 mb-4"></span>
            <h3 className="text-xl font-medium text-base-content mb-2">Selecciona almacén y categoría</h3>
            <p className="text-base-content/60">El catálogo de productos inventariables aparecerá aquí</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16">
            <span className="iconify lucide--boxes size-24 text-base-content/20 mb-4"></span>
            <h3 className="text-xl font-medium text-base-content mb-2">Sin productos inventariables</h3>
            <p className="text-base-content/60">Esta categoría no tiene productos marcados para inventario</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Clave</th>
                  <th>Producto</th>
                  <th>Color</th>
                  <th>Talla</th>
                  <th className="text-right">Stock actual</th>
                  <th className="w-32">Cantidad contada</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const value = countFor(row);
                  const changed = value !== "" && Number(value) !== row.current;
                  return (
                    <tr key={row.key}>
                      <td>{row.productKey ?? "—"}</td>
                      <td>{row.productTitle}</td>
                      <td>{colorDescription(row.colorId)}</td>
                      <td>{sizeDescription(row.sizeId)}</td>
                      <td className="text-right">
                        <span className="badge badge-ghost">{row.current}</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          className={`input input-bordered input-sm w-full ${changed ? "input-warning" : ""}`}
                          value={value}
                          onChange={(e) => setCount(row.key, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="form-control mt-4 max-w-md">
          <label className="label">
            <span className="label-text">Notas</span>
          </label>
          <textarea
            className="textarea textarea-bordered w-full"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Link href="/apps/commerce/inventory" className="btn btn-ghost">
            Cancelar
          </Link>
          <button className="btn btn-primary" onClick={handleSave} disabled={saveLoading || !ready || rows.length === 0}>
            {saveLoading ? <span className="loading loading-spinner loading-sm"></span> : "Registrar captura"}
          </button>
        </div>
      </div>
    </div>
  );
}
