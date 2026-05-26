"use client";

import { IAvailabilityExceptionRead } from "@/interfaces/IAppointment";

interface Props {
  exceptions: IAvailabilityExceptionRead[];
  onAdd: () => void;
  onEdit: (exc: IAvailabilityExceptionRead) => void;
  onDelete: (exceptionId: string) => void;
}

const formatDT = (iso: string) =>
  new Date(iso).toLocaleString("es-MX", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

export const ExceptionsPanel = ({ exceptions, onAdd, onEdit, onDelete }: Props) => (
  <div className="card bg-base-100 border border-base-300">
    <div className="card-body">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="iconify lucide--calendar-x size-5 text-error" />
          <h3 className="font-bold text-lg">Excepciones</h3>
          <span className="badge badge-error badge-sm">{exceptions.length}</span>
        </div>
        <button className="btn btn-sm btn-outline btn-error" onClick={onAdd}>
          <span className="iconify lucide--plus size-4" />
          Agregar excepción
        </button>
      </div>

      {exceptions.length === 0 ? (
        <div className="text-center py-8">
          <span className="iconify lucide--calendar-x size-12 text-base-content/20 mb-2" />
          <p className="text-base-content/50 text-sm">
            Sin excepciones. Las excepciones anulan la disponibilidad regular en fechas específicas.
          </p>
        </div>
      ) : (
        <div className="space-y-2 mt-2">
          {exceptions.map((exc) => (
            <div
              key={exc.id}
              className="flex items-start justify-between p-3 rounded-lg bg-base-200 gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`badge badge-sm ${exc.exception_type === "UNAVAILABLE" ? "badge-error" : "badge-warning"}`}
                  >
                    {exc.exception_type === "UNAVAILABLE" ? "No disponible" : "Horario especial"}
                  </span>
                </div>
                <p className="text-sm">
                  <span className="iconify lucide--calendar size-3.5 inline mr-1 text-base-content/50" />
                  {formatDT(exc.start_datetime)} – {formatDT(exc.end_datetime)}
                </p>
                {exc.reason && (
                  <p className="text-xs text-base-content/50 mt-0.5 italic">"{exc.reason}"</p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  className="btn btn-ghost btn-xs"
                  title="Editar"
                  onClick={() => onEdit(exc)}
                >
                  <span className="iconify lucide--pencil size-4" />
                </button>
                <button
                  className="btn btn-ghost btn-xs text-error"
                  title="Eliminar"
                  onClick={() => onDelete(exc.id)}
                >
                  <span className="iconify lucide--trash-2 size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
