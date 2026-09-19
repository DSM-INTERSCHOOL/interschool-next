"use client";

import { AppLink as Link } from "@/components/AppLink";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useProductSatForm } from "./hooks";

interface ProductSatFormPageProps {
  productSatId?: number;
}

export default function ProductSatFormPage({ productSatId }: ProductSatFormPageProps) {
  const { formData, updateFormField, loading, saveLoading, error, saveError, handleSave } =
    useProductSatForm(productSatId);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner message="Cargando código SAT..." />
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
            <span className="label-text">Clave SAT</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full font-mono"
            value={formData.key}
            onChange={(e) => updateFormField("key", e.target.value)}
            placeholder="Ej. 01010101"
          />
        </div>

        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Descripción</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={formData.description}
            onChange={(e) => updateFormField("description", e.target.value)}
            placeholder="Ej. No existe en el catálogo"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Link href="/apps/commerce/product-sat" className="btn btn-ghost">
            Cancelar
          </Link>
          <button className="btn btn-primary" onClick={handleSave} disabled={saveLoading}>
            {saveLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : productSatId ? (
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
