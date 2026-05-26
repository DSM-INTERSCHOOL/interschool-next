"use client";

import { useState, KeyboardEvent } from "react";
import { GlobalBlockFormData } from "../hooks/useGlobalBlocks";

const BLOCK_TYPE_OPTIONS = ["HOLIDAY", "MAINTENANCE", "BREAK", "OTHER"];

interface GlobalBlockFormProps {
  formData: GlobalBlockFormData;
  saveLoading: boolean;
  saveError: string | null;
  isEditing: boolean;
  onFieldChange: <K extends keyof GlobalBlockFormData>(
    field: K,
    value: GlobalBlockFormData[K]
  ) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const GlobalBlockForm = ({
  formData,
  saveLoading,
  saveError,
  isEditing,
  onFieldChange,
  onSave,
  onCancel,
}: GlobalBlockFormProps) => {
  const [personIdInput, setPersonIdInput] = useState("");

  const addPersonId = () => {
    const id = personIdInput.trim();
    if (!id || formData.person_ids.includes(id)) {
      setPersonIdInput("");
      return;
    }
    onFieldChange("person_ids", [...formData.person_ids, id]);
    setPersonIdInput("");
  };

  const removePersonId = (id: string) => {
    onFieldChange(
      "person_ids",
      formData.person_ids.filter((p) => p !== id)
    );
  };

  const handlePersonIdKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addPersonId();
    }
  };

  return (
    <div className="space-y-4">
      {/* Name */}
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Nombre *</legend>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Ej. Vacaciones de Primavera"
          value={formData.name}
          onChange={(e) => onFieldChange("name", e.target.value)}
        />
      </fieldset>

      {/* Block type */}
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Tipo de bloqueo</legend>
        <input
          type="text"
          className="input input-bordered w-full"
          list="block-type-options"
          placeholder="HOLIDAY, MAINTENANCE, BREAK…"
          value={formData.block_type}
          onChange={(e) => onFieldChange("block_type", e.target.value)}
        />
        <datalist id="block-type-options">
          {BLOCK_TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt} />
          ))}
        </datalist>
      </fieldset>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Fecha de inicio *</legend>
          <input
            type="datetime-local"
            className="input input-bordered w-full"
            value={formData.start_date}
            onChange={(e) => onFieldChange("start_date", e.target.value)}
          />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Fecha de fin *</legend>
          <input
            type="datetime-local"
            className="input input-bordered w-full"
            value={formData.end_date}
            onChange={(e) => onFieldChange("end_date", e.target.value)}
          />
        </fieldset>
      </div>

      {/* Toggles row */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={formData.applies_to_all}
            onChange={(e) => onFieldChange("applies_to_all", e.target.checked)}
          />
          <div>
            <p className="font-medium text-sm">Aplica a todos</p>
            <p className="text-xs text-base-content/50">
              Bloqueo para toda la escuela
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={formData.recurring}
            onChange={(e) => onFieldChange("recurring", e.target.checked)}
          />
          <div>
            <p className="font-medium text-sm">Recurrente</p>
            <p className="text-xs text-base-content/50">Se repite cada año</p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="toggle toggle-success"
            checked={formData.active}
            onChange={(e) => onFieldChange("active", e.target.checked)}
          />
          <div>
            <p className="font-medium text-sm">Activo</p>
            <p className="text-xs text-base-content/50">
              El bloqueo está en efecto
            </p>
          </div>
        </label>
      </div>

      {/* Person IDs — only when applies_to_all = false */}
      {!formData.applies_to_all && (
        <fieldset className="fieldset">
          <legend className="fieldset-legend">IDs de personas</legend>
          <div className="flex gap-2">
            <input
              type="text"
              className="input input-bordered flex-1"
              placeholder="Ingresa un ID y presiona Enter"
              value={personIdInput}
              onChange={(e) => setPersonIdInput(e.target.value)}
              onKeyDown={handlePersonIdKeyDown}
            />
            <button
              type="button"
              className="btn btn-primary btn-outline"
              onClick={addPersonId}
              disabled={!personIdInput.trim()}
            >
              Agregar
            </button>
          </div>
          {formData.person_ids.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.person_ids.map((id) => (
                <span key={id} className="badge badge-primary gap-2 py-3">
                  {id}
                  <button
                    type="button"
                    onClick={() => removePersonId(id)}
                    className="hover:text-error"
                  >
                    <span className="iconify lucide--x size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-base-content/50 mt-1">
            Presiona Enter o coma para agregar cada ID
          </p>
        </fieldset>
      )}

      {/* Save error */}
      {saveError && (
        <div className="alert alert-error">
          <span className="iconify lucide--alert-circle size-5" />
          <span className="text-sm">{saveError}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onCancel}
          disabled={saveLoading}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onSave}
          disabled={saveLoading}
        >
          {saveLoading ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              Guardando…
            </>
          ) : (
            <>
              <span className="iconify lucide--save size-4" />
              {isEditing ? "Guardar cambios" : "Crear bloqueo"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
