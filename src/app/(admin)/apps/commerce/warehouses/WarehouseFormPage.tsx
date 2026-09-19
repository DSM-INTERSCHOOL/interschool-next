"use client";

import { AppLink as Link } from "@/components/AppLink";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useWarehouseForm } from "./hooks";

interface WarehouseFormPageProps {
  warehouseId?: number;
}

export default function WarehouseFormPage({ warehouseId }: WarehouseFormPageProps) {
  const { formData, updateFormField, loading, saveLoading, error, saveError, handleSave } =
    useWarehouseForm(warehouseId);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner message="Cargando almacén..." />
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        {error && (
          <div className="alert alert-error mb-4">
            <span className="iconify lucide--alert-circle size-6"></span>
            <div>{error}</div>
          </div>
        )}
        {saveError && (
          <div className="alert alert-error mb-4">
            <span className="iconify lucide--alert-circle size-6"></span>
            <div>{saveError}</div>
          </div>
        )}

        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Descripción</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={formData.description}
            onChange={(e) => updateFormField("description", e.target.value)}
            placeholder="Ej. Bodega Central"
          />
        </div>

        <div className="form-control mb-4">
          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              className="checkbox"
              checked={formData.for_sale}
              onChange={(e) => updateFormField("for_sale", e.target.checked)}
            />
            <span className="label-text">Almacén de venta</span>
          </label>
          <p className="text-sm text-base-content/60">
            Solo puede haber un almacén de venta por escuela; marcarlo aquí desmarcará cualquier otro.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Link href="/apps/commerce/warehouses" className="btn btn-ghost">
            Cancelar
          </Link>
          <button className="btn btn-primary" onClick={handleSave} disabled={saveLoading}>
            {saveLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : warehouseId ? (
              "Actualizar"
            ) : (
              "Guardar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
