"use client";

import { IAppointmentRead, AppointmentStatus, IAppointmentParticipant } from "@/interfaces/IAppointment";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; cls: string }> = {
  PENDING:   { label: "Pendiente",  cls: "badge-warning" },
  CONFIRMED: { label: "Confirmada", cls: "badge-success" },
  CANCELLED: { label: "Cancelada",  cls: "badge-error" },
  COMPLETED: { label: "Completada", cls: "badge-neutral" },
  NO_SHOW:   { label: "No asistió", cls: "badge-ghost" },
};

const personName = (p: IAppointmentParticipant["person"]) =>
  [p.given_name, p.paternal_surname].filter(Boolean).join(" ") || p.person_internal_id || p.id;

const formatDT = (iso: string) =>
  new Date(iso).toLocaleString("es-MX", {
    weekday: "short", day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true });

interface Props {
  appointments: IAppointmentRead[];
  loading: boolean;
  error: string | null;
  viewYear: number;
  viewMonth: number;
  onPrev: () => void;
  onNext: () => void;
  onAdd: () => void;
}

export const AppointmentsList = ({
  appointments, loading, error, viewYear, viewMonth, onPrev, onNext, onAdd,
}: Props) => {
  const now = new Date();
  const isCurrentMonth = viewYear === now.getUTCFullYear() && viewMonth === now.getUTCMonth();

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">

        {/* Header + month nav */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="iconify lucide--calendar-clock size-5 text-primary" />
            <h2 className="card-title text-xl">Mis Citas</h2>
            {!loading && (
              <span className="badge badge-primary badge-sm">{appointments.length}</span>
            )}
            <button
              className="btn btn-primary btn-sm btn-circle ml-1"
              title="Nueva cita"
              onClick={onAdd}
            >
              <span className="iconify lucide--plus size-4" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button className="btn btn-ghost btn-sm btn-circle" onClick={onPrev} disabled={loading}>
              <span className="iconify lucide--chevron-left size-4" />
            </button>
            <span className="text-sm font-medium min-w-36 text-center">
              {MONTH_NAMES[viewMonth]} {viewYear}
              {isCurrentMonth && (
                <span className="ml-1.5 badge badge-primary badge-xs align-middle">Este mes</span>
              )}
            </span>
            <button className="btn btn-ghost btn-sm btn-circle" onClick={onNext} disabled={loading}>
              <span className="iconify lucide--chevron-right size-4" />
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="alert alert-error">
            <span className="iconify lucide--alert-circle size-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && appointments.length === 0 && (
          <div className="text-center py-14">
            <span className="iconify lucide--calendar-x size-14 text-base-content/20 block mx-auto mb-3" />
            <p className="text-base-content/50 text-sm">
              Sin citas para {MONTH_NAMES[viewMonth]} {viewYear}.
            </p>
          </div>
        )}

        {/* List */}
        {!loading && !error && appointments.length > 0 && (
          <div className="space-y-3">
            {appointments.map((appt) => {
              const status = STATUS_CONFIG[appt.status] ?? { label: appt.status, cls: "badge-ghost" };
              const start = new Date(appt.scheduled_start);
              const activeParticipants = appt.participants.filter((p) => !p.removed_at);
              const others = activeParticipants.filter((p) => p.role !== "ORGANIZER");

              return (
                <div key={appt.id} className="flex items-start gap-3 p-3 rounded-lg bg-base-200">

                  {/* Date block */}
                  <div className="shrink-0 w-12 text-center bg-base-100 rounded-lg p-1.5">
                    <p className="text-lg font-bold leading-none">{start.getDate()}</p>
                    <p className="text-xs text-base-content/50 uppercase">
                      {MONTH_NAMES[start.getMonth()].slice(0, 3)}
                    </p>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`badge badge-sm ${status.cls}`}>{status.label}</span>
                      {appt.title && (
                        <span className="text-sm font-semibold truncate">{appt.title}</span>
                      )}
                    </div>

                    {/* Time */}
                    {appt.without_time ? (
                      <p className="text-sm text-base-content/70">Todo el día</p>
                    ) : (
                      <p className="text-sm text-base-content/70">
                        <span className="iconify lucide--clock size-3.5 inline mr-1" />
                        {formatDT(appt.scheduled_start)}
                        {" – "}
                        {formatTime(appt.scheduled_end)}
                        <span className="ml-1.5 text-base-content/40 text-xs">({appt.duration_minutes} min)</span>
                      </p>
                    )}

                    {/* Location / virtual */}
                    {appt.location && (
                      <p className="text-xs text-base-content/50 mt-0.5">
                        <span className="iconify lucide--map-pin size-3.5 inline mr-1" />
                        {appt.location}
                      </p>
                    )}
                    {appt.virtual_link && (
                      <p className="text-xs text-base-content/50 mt-0.5">
                        <span className="iconify lucide--video size-3.5 inline mr-1" />
                        Reunión virtual
                      </p>
                    )}

                    {/* Description */}
                    {appt.description && (
                      <p className="text-xs text-base-content/50 mt-0.5 truncate">{appt.description}</p>
                    )}

                    {/* Participants */}
                    {others.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        <span className="iconify lucide--users size-3.5 text-base-content/40 shrink-0" />
                        {others.slice(0, 3).map((p) => (
                          <span key={p.person_id} className="badge badge-ghost badge-xs">
                            {personName(p.person)}
                          </span>
                        ))}
                        {others.length > 3 && (
                          <span className="badge badge-ghost badge-xs">+{others.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
