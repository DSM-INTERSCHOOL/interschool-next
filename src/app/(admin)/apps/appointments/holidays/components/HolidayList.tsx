"use client";

import { IHolidayRead, HolidayType } from "@/interfaces/IAppointment";

interface HolidayListProps {
  holidays: IHolidayRead[];
  onEdit: (holiday: IHolidayRead) => void;
  onDelete: (holidayId: string) => void;
}

export const MONTH_NAMES = [
  "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const DAY_NAMES = [
  "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo",
];

const NTH_LABELS: Record<number, string> = { 1: "1er", 2: "2do", 3: "3er", 4: "4to" };

const TYPE_COLORS: Record<HolidayType, string> = {
  FIXED: "badge-primary",
  NTH_WEEKDAY: "badge-secondary",
  LAST_WEEKDAY_BEFORE: "badge-accent",
};

const TYPE_LABELS: Record<HolidayType, string> = {
  FIXED: "Fijo",
  NTH_WEEKDAY: "Nésimo",
  LAST_WEEKDAY_BEFORE: "Último antes de",
};

export const describeDateRule = (h: IHolidayRead): string => {
  const month = MONTH_NAMES[h.month] ?? "?";
  if (h.holiday_type === "FIXED") {
    return `${month} ${h.day}`;
  }
  if (h.holiday_type === "NTH_WEEKDAY") {
    const nth = h.nth != null ? NTH_LABELS[h.nth] ?? `${h.nth}º` : "?";
    const dow = h.day_of_week != null ? DAY_NAMES[h.day_of_week] ?? "?" : "?";
    return `${nth} ${dow} de ${month}`;
  }
  if (h.holiday_type === "LAST_WEEKDAY_BEFORE") {
    const dow = h.day_of_week != null ? DAY_NAMES[h.day_of_week] ?? "?" : "?";
    return `Último ${dow} antes del ${month} ${h.before_day}`;
  }
  return "—";
};

export const HolidayList = ({ holidays, onEdit, onDelete }: HolidayListProps) => {
  if (holidays.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="iconify lucide--sun size-20 text-base-content/20 mb-4" />
        <h3 className="text-xl font-medium text-base-content mb-2">
          Sin días festivos
        </h3>
        <p className="text-base-content/60">
          Crea días festivos para bloquear automáticamente citas en esas fechas
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead className="sticky top-0 z-10 bg-base-200">
          <tr>
            <th className="bg-base-200">Nombre</th>
            <th className="bg-base-200">Tipo</th>
            <th className="bg-base-200">Mes</th>
            <th className="bg-base-200">Regla de fecha</th>
            <th className="bg-base-200 text-center">Estado</th>
            <th className="bg-base-200">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {holidays.map((holiday) => (
            <tr key={holiday.id}>
              <td>
                <span className="font-medium">{holiday.name}</span>
              </td>
              <td>
                <span className={`badge ${TYPE_COLORS[holiday.holiday_type]} badge-sm`}>
                  {TYPE_LABELS[holiday.holiday_type]}
                </span>
              </td>
              <td className="text-sm">{MONTH_NAMES[holiday.month] ?? "?"}</td>
              <td className="text-sm text-base-content/70">
                {describeDateRule(holiday)}
              </td>
              <td className="text-center">
                {holiday.active ? (
                  <span className="badge badge-success badge-sm">Activo</span>
                ) : (
                  <span className="badge badge-ghost badge-sm">Inactivo</span>
                )}
              </td>
              <td>
                <div className="flex gap-1">
                  <button
                    className="btn btn-ghost btn-xs"
                    title="Editar"
                    onClick={() => onEdit(holiday)}
                  >
                    <span className="iconify lucide--pencil size-4" />
                  </button>
                  <button
                    className="btn btn-ghost btn-xs text-error"
                    title="Eliminar"
                    onClick={() => onDelete(holiday.id)}
                  >
                    <span className="iconify lucide--trash-2 size-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
