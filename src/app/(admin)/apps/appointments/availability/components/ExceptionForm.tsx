"use client";

import { ExceptionFormData } from "../hooks/useAvailability";
import { ExceptionType } from "@/interfaces/IAppointment";

interface Props {
  formData: ExceptionFormData;
  saveLoading: boolean;
  saveError: string | null;
  isEditing: boolean;
  onFieldChange: <K extends keyof ExceptionFormData>(field: K, value: ExceptionFormData[K]) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const ExceptionForm = ({ formData, saveLoading, saveError, isEditing, onFieldChange, onSave, onCancel }: Props) => (
  <div className="space-y-4">
    {/* Exception type */}
    <fieldset className="fieldset">
      <legend className="fieldset-legend">Tipo de excepción</legend>
      <div className="join">
        {(["UNAVAILABLE", "CUSTOM_HOURS"] as ExceptionType[]).map((type) => (
          <button
            key={type}
            type="button"
            className={`join-item btn btn-sm ${formData.exception_type === type ? "btn-error" : "btn-outline"}`}
            onClick={() => onFieldChange("exception_type", type)}
          >
            {type === "UNAVAILABLE" ? (
              <><span className="iconify lucide--ban size-4" /> No disponible</>
            ) : (
              <><span className="iconify lucide--clock size-4" /> Horario especial</>
            )}
          </button>
        ))}
      </div>
    </fieldset>

    {/* Datetime range */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Inicio *</legend>
        <input
          type="datetime-local"
          className="input input-bordered w-full"
          value={formData.start_datetime}
          onChange={(e) => onFieldChange("start_datetime", e.target.value)}
        />
      </fieldset>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Fin *</legend>
        <input
          type="datetime-local"
          className="input input-bordered w-full"
          value={formData.end_datetime}
          onChange={(e) => onFieldChange("end_datetime", e.target.value)}
        />
      </fieldset>
    </div>

    {/* Reason */}
    <fieldset className="fieldset">
      <legend className="fieldset-legend">Motivo (opcional)</legend>
      <input
        type="text"
        className="input input-bordered w-full"
        placeholder="Ej. Cita médica, Día festivo local…"
        value={formData.reason}
        onChange={(e) => onFieldChange("reason", e.target.value)}
      />
    </fieldset>

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
          <><span className="iconify lucide--save size-4" /> {isEditing ? "Guardar cambios" : "Agregar excepción"}</>
        )}
      </button>
    </div>
  </div>
);
