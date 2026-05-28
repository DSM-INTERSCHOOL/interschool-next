"use client";

import { useState } from "react";
import { IAppointmentRead, AppointmentStatus, IAppointmentParticipant } from "@/interfaces/IAppointment";
import { updateParticipantStatus, updateAppointmentStatus } from "@/services/appointment.service";

import { getOrgConfig } from "@/lib/orgConfig";

type ParticipantUpdateStatus = "CONFIRMED" | "DECLINED" | "CANCELLED";

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
  personId: string | null;
  onReload: () => void;
  onSelect: (appt: IAppointmentRead) => void;
}

export const AppointmentsList = ({
  appointments, loading, error, viewYear, viewMonth, onPrev, onNext, onAdd,
  personId, onReload, onSelect,
}: Props) => {
  const now = new Date();
  const isCurrentMonth = viewYear === now.getUTCFullYear() && viewMonth === now.getUTCMonth();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const isOrganizer = (appt: IAppointmentRead) =>
    !!personId && String(appt.host_person_id) === String(personId);

  const findMyParticipant = (appt: IAppointmentRead) => {
    if (!personId) return null;
    return appt.participants.find(
      (p) => String(p.person_id) === String(personId) && !p.removed_at && p.role === "ATTENDEE"
    ) ?? null;
  };

  const handleStatusUpdate = async (appointmentId: string, status: ParticipantUpdateStatus) => {
    if (!personId) return;
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;
    setConfirmingId(appointmentId);
    try {
      await updateParticipantStatus({ schoolId, appointmentId, personId, status });
      onReload();
    } finally {
      setConfirmingId(null);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;
    setCancellingId(appointmentId);
    try {
      await updateAppointmentStatus({ schoolId, appointmentId, status: "CANCELLED" });
      onReload();
    } finally {
      setCancellingId(null);
    }
  };

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
              const myParticipant = findMyParticipant(appt);
              const amOrganizer = isOrganizer(appt);
              const isConfirming = confirmingId === appt.id;
              const isCancelling = cancellingId === appt.id;
              const needsAction = myParticipant?.status === "PENDING";
              const canCancelAppt = amOrganizer &&
                appt.status !== "CANCELLED" && appt.status !== "COMPLETED";

              return (
                <div
                  key={appt.id}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer hover:brightness-95 transition-[filter] ${
                    needsAction ? "bg-warning/10 border border-warning/30" : "bg-base-200"
                  }`}
                  onClick={() => onSelect(appt)}
                >
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
                      <p className="text-sm text-base-content/70">Horario abierto</p>
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

                    {/* ── Organizer cancel row ───────────────────────────── */}
                    {canCancelAppt && (
                      <div className="mt-2 pt-2 border-t border-base-200 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs text-base-content/50 flex-1">
                          <span className="iconify lucide--shield size-3.5 inline mr-1" />
                          Organizador
                        </span>
                        <button
                          className="btn btn-xs btn-outline btn-error"
                          disabled={isCancelling}
                          onClick={() => handleCancelAppointment(appt.id)}
                        >
                          {isCancelling
                            ? <span className="loading loading-spinner loading-xs" />
                            : <><span className="iconify lucide--x size-3" /> Cancelar cita</>
                          }
                        </button>
                      </div>
                    )}

                    {/* ── Participant action row ──────────────────────────── */}
                    {myParticipant && (
                      <div className="mt-2 pt-2 border-t border-base-200 flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                        {myParticipant.status === "PENDING" && (
                          <>
                            <span className="text-xs text-warning font-medium flex-1">
                              <span className="iconify lucide--clock-alert size-3.5 inline mr-1" />
                              Pendiente de confirmación
                            </span>
                            <button
                              className="btn btn-xs btn-success"
                              disabled={isConfirming}
                              onClick={() => handleStatusUpdate(appt.id, "CONFIRMED")}
                            >
                              {isConfirming
                                ? <span className="loading loading-spinner loading-xs" />
                                : <><span className="iconify lucide--check size-3" /> Confirmar</>
                              }
                            </button>
                            <button
                              className="btn btn-xs btn-outline btn-error"
                              disabled={isConfirming}
                              onClick={() => handleStatusUpdate(appt.id, "DECLINED")}
                            >
                              Declinar
                            </button>
                          </>
                        )}

                        {myParticipant.status === "CONFIRMED" && (
                          <>
                            <span className="text-xs text-success font-medium flex-1">
                              <span className="iconify lucide--check-circle size-3.5 inline mr-1" />
                              Asistencia confirmada
                            </span>
                            <button
                              className="btn btn-xs btn-ghost text-error"
                              disabled={isConfirming}
                              onClick={() => handleStatusUpdate(appt.id, "CANCELLED")}
                            >
                              {isConfirming
                                ? <span className="loading loading-spinner loading-xs" />
                                : "Cancelar asistencia"
                              }
                            </button>
                          </>
                        )}

                        {myParticipant.status === "DECLINED" && (
                          <>
                            <span className="text-xs text-base-content/50 flex-1">
                              <span className="iconify lucide--x-circle size-3.5 inline mr-1" />
                              Asistencia declinada
                            </span>
                            {appt.status !== "CANCELLED" && (
                              <button
                                className="btn btn-xs btn-outline btn-success"
                                disabled={isConfirming}
                                onClick={() => handleStatusUpdate(appt.id, "CONFIRMED")}
                              >
                                {isConfirming
                                  ? <span className="loading loading-spinner loading-xs" />
                                  : "Reconsiderar"
                                }
                              </button>
                            )}
                          </>
                        )}

                        {myParticipant.status === "CANCELLED" && (
                          <>
                            <span className="text-xs text-base-content/40 flex-1">
                              <span className="iconify lucide--ban size-3.5 inline mr-1" />
                              Participación cancelada
                            </span>
                            {appt.status !== "CANCELLED" && (
                              <button
                                className="btn btn-xs btn-outline"
                                disabled={isConfirming}
                                onClick={() => handleStatusUpdate(appt.id, "CONFIRMED")}
                              >
                                {isConfirming
                                  ? <span className="loading loading-spinner loading-xs" />
                                  : "Reinscribirse"
                                }
                              </button>
                            )}
                          </>
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
