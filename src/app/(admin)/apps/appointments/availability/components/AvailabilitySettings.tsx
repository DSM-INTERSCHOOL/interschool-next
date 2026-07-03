"use client";

import { IPersonAvailabilityRead, AvailabilityType } from "@/interfaces/IAppointment";
import { SettingsFormData } from "../hooks/useAvailability";

const TIMEZONES = [
  "America/Mexico_City",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "America/Bogota",
  "America/Lima",
  "America/Santiago",
  "America/Buenos_Aires",
  "UTC",
  "Europe/Madrid",
];

interface Props {
  availability: IPersonAvailabilityRead | null;
  notFound: boolean;
  personId: string;
  settingsForm: SettingsFormData;
  saveLoading: boolean;
  saveError: string | null;
  onFieldChange: <K extends keyof SettingsFormData>(field: K, value: SettingsFormData[K]) => void;
  onSave: () => void;
}

export const AvailabilitySettings = ({
  availability,
  notFound,
  personId,
  settingsForm,
  saveLoading,
  saveError,
  onFieldChange,
  onSave,
}: Props) => {
  const isCreate = notFound || !availability;

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="iconify lucide--settings size-4 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Configuración de disponibilidad</h3>
            <p className="text-xs text-base-content/50">Persona ID: {personId}</p>
          </div>
          {!isCreate && (
            <div className="ml-auto">
              {availability?.active ? (
                <span className="badge badge-success badge-sm">Activo</span>
              ) : (
                <span className="badge badge-ghost badge-sm">Inactivo</span>
              )}
            </div>
          )}
        </div>

        {isCreate && (
          <div className="alert alert-info mb-4">
            <span className="iconify lucide--info size-5" />
            <span className="text-sm">
              Esta persona no tiene configuración de disponibilidad. Completa el formulario para crearla.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Availability type */}
          <fieldset className="fieldset sm:col-span-2">
            <legend className="fieldset-legend">Tipo de disponibilidad</legend>
            <div className="join">
              {(["OPEN", "SPECIFIC"] as AvailabilityType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`join-item btn btn-sm ${settingsForm.availability_type === type ? "btn-primary" : "btn-outline"}`}
                  onClick={() => onFieldChange("availability_type", type)}
                >
                  {type === "OPEN" ? (
                    <><span className="iconify lucide--unlock size-4" /> Abierto</>
                  ) : (
                    <><span className="iconify lucide--calendar-days size-4" /> Específico</>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-base-content/50 mt-1">
              {settingsForm.availability_type === "OPEN"
                ? "La persona está siempre disponible. Las reglas se ignoran."
                : "La disponibilidad se rige por las reglas semanales configuradas abajo."}
            </p>
          </fieldset>

          {/* Slot duration */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Duración del turno (min)</legend>
            <input
              type="number"
              className="input input-bordered w-full"
              min={5}
              max={480}
              step={5}
              value={settingsForm.slot_duration_minutes}
              onChange={(e) => onFieldChange("slot_duration_minutes", Number(e.target.value))}
            />
          </fieldset>

          {/* Timezone */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Zona horaria</legend>
            <input
              type="text"
              className="input input-bordered w-full"
              list="tz-options"
              value={settingsForm.timezone}
              onChange={(e) => onFieldChange("timezone", e.target.value)}
              placeholder="America/Mexico_City"
            />
            <datalist id="tz-options">
              {TIMEZONES.map((tz) => <option key={tz} value={tz} />)}
            </datalist>
          </fieldset>

          {/* Active */}
          <fieldset className="fieldset sm:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="toggle toggle-success"
                checked={settingsForm.active}
                onChange={(e) => onFieldChange("active", e.target.checked)}
              />
              <div>
                <p className="font-medium text-sm">Activo</p>
                <p className="text-xs text-base-content/50">La disponibilidad se considera para agendar reuniones</p>
              </div>
            </label>
          </fieldset>
        </div>

        {saveError && (
          <div className="alert alert-error mt-4">
            <span className="iconify lucide--alert-circle size-5" />
            <span className="text-sm">{saveError}</span>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button className="btn btn-primary" onClick={onSave} disabled={saveLoading}>
            {saveLoading ? (
              <><span className="loading loading-spinner loading-sm" /> Guardando…</>
            ) : isCreate ? (
              <><span className="iconify lucide--plus size-4" /> Crear configuración</>
            ) : (
              <><span className="iconify lucide--save size-4" /> Guardar cambios</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
