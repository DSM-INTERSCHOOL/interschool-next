"use client";

import { HolidayFormData } from "../hooks/useHolidays";
import { HolidayType } from "@/interfaces/IAppointment";
import { MONTH_NAMES, DAY_NAMES } from "./HolidayList";

interface HolidayFormProps {
  formData: HolidayFormData;
  saveLoading: boolean;
  saveError: string | null;
  isEditing: boolean;
  onFieldChange: <K extends keyof HolidayFormData>(
    field: K,
    value: HolidayFormData[K]
  ) => void;
  onSave: () => void;
  onCancel: () => void;
}

const HOLIDAY_TYPES: { value: HolidayType; label: string; description: string }[] = [
  { value: "FIXED", label: "Fijo", description: "Misma fecha cada año (ej. 25 de Dic)" },
  { value: "NTH_WEEKDAY", label: "Nésimo día de la semana", description: "El Nésimo día de la semana en un mes (ej. 3er lunes de enero)" },
  { value: "LAST_WEEKDAY_BEFORE", label: "Último antes de", description: "El último día de la semana antes de una fecha límite" },
];

export const HolidayForm = ({
  formData,
  saveLoading,
  saveError,
  isEditing,
  onFieldChange,
  onSave,
  onCancel,
}: HolidayFormProps) => {
  const handleTypeChange = (type: HolidayType) => {
    onFieldChange("holiday_type", type);
    // Reset type-specific fields
    onFieldChange("day", type === "FIXED" ? 1 : "");
    onFieldChange("nth", type === "NTH_WEEKDAY" ? 1 : "");
    onFieldChange("day_of_week", type !== "FIXED" ? 0 : "");
    onFieldChange("before_day", type === "LAST_WEEKDAY_BEFORE" ? 1 : "");
  };

  return (
    <div className="space-y-4">
      {/* Name */}
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Nombre *</legend>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Ej. Día de la Independencia"
          value={formData.name}
          onChange={(e) => onFieldChange("name", e.target.value)}
        />
      </fieldset>

      {/* Holiday type */}
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Tipo de día festivo</legend>
        <div className="space-y-2">
          {HOLIDAY_TYPES.map((opt) => (
            <label key={opt.value} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-base-300 hover:bg-base-200 transition-colors">
              <input
                type="radio"
                className="radio radio-primary mt-0.5"
                name="holiday_type"
                checked={formData.holiday_type === opt.value}
                onChange={() => handleTypeChange(opt.value)}
              />
              <div>
                <p className="font-medium text-sm">{opt.label}</p>
                <p className="text-xs text-base-content/50">{opt.description}</p>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Month — always shown */}
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Mes *</legend>
        <select
          className="select select-bordered w-full"
          value={formData.month}
          onChange={(e) => onFieldChange("month", Number(e.target.value))}
        >
          {MONTH_NAMES.slice(1).map((name, i) => (
            <option key={i + 1} value={i + 1}>{name}</option>
          ))}
        </select>
      </fieldset>

      {/* FIXED: day */}
      {formData.holiday_type === "FIXED" && (
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Día del mes *</legend>
          <input
            type="number"
            className="input input-bordered w-full"
            min={1}
            max={31}
            value={formData.day}
            onChange={(e) => onFieldChange("day", e.target.value === "" ? "" : Number(e.target.value))}
          />
        </fieldset>
      )}

      {/* NTH_WEEKDAY: nth + day_of_week */}
      {formData.holiday_type === "NTH_WEEKDAY" && (
        <div className="grid grid-cols-2 gap-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Ocurrencia *</legend>
            <select
              className="select select-bordered w-full"
              value={formData.nth}
              onChange={(e) => onFieldChange("nth", Number(e.target.value))}
            >
              <option value={1}>1er</option>
              <option value={2}>2do</option>
              <option value={3}>3er</option>
              <option value={4}>4to</option>
            </select>
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Día de la semana *</legend>
            <select
              className="select select-bordered w-full"
              value={formData.day_of_week}
              onChange={(e) => onFieldChange("day_of_week", Number(e.target.value))}
            >
              {DAY_NAMES.map((name, i) => (
                <option key={i} value={i}>{name}</option>
              ))}
            </select>
          </fieldset>
        </div>
      )}

      {/* LAST_WEEKDAY_BEFORE: day_of_week + before_day */}
      {formData.holiday_type === "LAST_WEEKDAY_BEFORE" && (
        <div className="grid grid-cols-2 gap-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Día de la semana *</legend>
            <select
              className="select select-bordered w-full"
              value={formData.day_of_week}
              onChange={(e) => onFieldChange("day_of_week", Number(e.target.value))}
            >
              {DAY_NAMES.map((name, i) => (
                <option key={i} value={i}>{name}</option>
              ))}
            </select>
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Antes del día *</legend>
            <input
              type="number"
              className="input input-bordered w-full"
              min={1}
              max={31}
              value={formData.before_day}
              onChange={(e) => onFieldChange("before_day", e.target.value === "" ? "" : Number(e.target.value))}
            />
          </fieldset>
        </div>
      )}

      {/* Active */}
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
            Este día festivo se incluye al aplicar al año
          </p>
        </div>
      </label>

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
              {isEditing ? "Guardar cambios" : "Crear día festivo"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
