"use client";

import { AppLink as Link } from "@/components/AppLink";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useTerminalForm } from "./hooks";

interface TerminalFormPageProps {
  terminalId: number;
}

export default function TerminalFormPage({ terminalId }: TerminalFormPageProps) {
  const { formData, updateFormField, loading, saveLoading, error, saveError, handleSave } =
    useTerminalForm(terminalId);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner message="Cargando terminal..." />
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
            <span className="label-text">Device ID</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full font-mono"
            value={formData.device_id}
            readOnly
            disabled
          />
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Lo genera el equipo al registrarse; no se puede cambiar.
            </span>
          </label>
        </div>

        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Nombre corto</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={formData.name}
            onChange={(e) => updateFormField("name", e.target.value)}
            placeholder="Ej. Mostrador 1"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Link href="/apps/commerce/caja/terminales" className="btn btn-ghost">
            Cancelar
          </Link>
          <button className="btn btn-primary" onClick={handleSave} disabled={saveLoading}>
            {saveLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Actualizar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
