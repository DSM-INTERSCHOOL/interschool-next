"use client";

import { AppLink as Link } from "@/components/AppLink";
import { MovementLineItemsEditor } from "./components";
import { useEntradaForm, useMovementCatalogs } from "./hooks";

export default function EntradaFormPage() {
  const {
    warehouseId,
    setWarehouseId,
    notes,
    setNotes,
    lines,
    addLine,
    removeLine,
    updateLine,
    saveLoading,
    saveError,
    handleSave,
  } = useEntradaForm();
  const catalogs = useMovementCatalogs();

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <p className="text-base-content/60 text-sm mb-4">
          Registra la entrada de mercancía a un almacén (recepción de compra, carga inicial, ajuste
          positivo). El costo es requerido en cada línea.
        </p>

        {(saveError || catalogs.error) && (
          <div className="alert alert-error mb-4">
            <span className="iconify lucide--alert-circle size-6"></span>
            <div>{saveError || catalogs.error}</div>
          </div>
        )}

        <div className="form-control mb-4 max-w-sm">
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

        <MovementLineItemsEditor
          lines={lines}
          products={catalogs.products}
          colors={catalogs.colors}
          sizes={catalogs.sizes}
          loading={catalogs.loading}
          onAddLine={addLine}
          onRemoveLine={removeLine}
          onUpdateLine={updateLine}
        />

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
          <button className="btn btn-primary" onClick={handleSave} disabled={saveLoading}>
            {saveLoading ? <span className="loading loading-spinner loading-sm"></span> : "Registrar entrada"}
          </button>
        </div>
      </div>
    </div>
  );
}
