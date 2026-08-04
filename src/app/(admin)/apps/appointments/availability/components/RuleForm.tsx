"use client";

import { RuleFormData } from "../hooks/useAvailability";

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

interface Props {
  formData: RuleFormData;
  saveLoading: boolean;
  saveError: string | null;
  isEditing: boolean;
  onFieldChange: <K extends keyof RuleFormData>(field: K, value: RuleFormData[K]) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const RuleForm = ({ formData, saveLoading, saveError, isEditing, onFieldChange, onSave, onCancel }: Props) => {
  const toggleDay = (day: number) => {
    const current = formData.days_of_week;
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day].sort();
    onFieldChange("days_of_week", next);
  };

  return (
    <div className="space-y-4">
      {/* Days of week */}
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Días *</legend>
        <div className="flex flex-wrap gap-2">
          {DAY_LABELS.map((label, i) => (
            <button
              key={i}
              type="button"
              className={`btn btn-sm ${formData.days_of_week.includes(i) ? "btn-primary" : "btn-outline"}`}
              onClick={() => toggleDay(i)}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Time range */}
      <div className="grid grid-cols-2 gap-4">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Hora de inicio *</legend>
          <input
            type="time"
            className="input input-bordered w-full"
            value={formData.start_time}
            onChange={(e) => onFieldChange("start_time", e.target.value)}
          />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Hora de fin *</legend>
          <input
            type="time"
            className="input input-bordered w-full"
            value={formData.end_time}
            onChange={(e) => onFieldChange("end_time", e.target.value)}
          />
        </fieldset>
      </div>

      {/* Optional date range */}
      <div className="grid grid-cols-2 gap-4">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Válida desde (opcional)</legend>
          <input
            type="date"
            className="input input-bordered w-full"
            value={formData.valid_from}
            onChange={(e) => onFieldChange("valid_from", e.target.value)}
          />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Válida hasta (opcional)</legend>
          <input
            type="date"
            className="input input-bordered w-full"
            value={formData.valid_until}
            onChange={(e) => onFieldChange("valid_until", e.target.value)}
          />
        </fieldset>
      </div>

      {/* Active */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="toggle toggle-success"
          checked={formData.active}
          onChange={(e) => onFieldChange("active", e.target.checked)}
        />
        <p className="font-medium text-sm">Regla activa</p>
      </label>

      {saveError && (
        <div className="alert alert-error">
          <span className="iconify lucide--alert-circle size-5" />
          <span className="text-sm">{saveError}</span>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={saveLoading}>
          Cancelar
        </button>
        <button type="button" className="btn btn-primary" onClick={onSave} disabled={saveLoading}>
          {saveLoading ? (
            <><span className="loading loading-spinner loading-sm" /> Guardando…</>
          ) : (
            <><span className="iconify lucide--save size-4" /> {isEditing ? "Guardar cambios" : "Agregar regla"}</>
          )}
        </button>
      </div>
    </div>
  );
};
