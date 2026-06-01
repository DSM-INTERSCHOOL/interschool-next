"use client";

import { useState, useMemo } from "react";
import { IAppointmentRead, AppointmentStatus, IAppointmentParticipant } from "@/interfaces/IAppointment";
import { updateParticipantStatus, updateAppointmentStatus, deleteAppointment } from "@/services/appointment.service";
import { getOrgConfig } from "@/lib/orgConfig";

// ── Types ─────────────────────────────────────────────────────────────────────

type ParticipantUpdateStatus = "CONFIRMED" | "DECLINED" | "CANCELLED";
type FilterType = "all" | "pending" | "confirmed";
type ViewType  = "list" | "calendar";

// ── Constants ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DAY_HEADERS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; cls: string; calCls: string }> = {
  PENDING:   { label: "Pendiente",  cls: "badge-warning",  calCls: "bg-warning/20 text-warning border border-warning/30" },
  CONFIRMED: { label: "Confirmada", cls: "badge-success",  calCls: "bg-success/20 text-success border border-success/30" },
  CANCELLED: { label: "Cancelada",  cls: "badge-error",    calCls: "bg-error/20 text-error border border-error/30" },
  COMPLETED: { label: "Completada", cls: "badge-neutral",  calCls: "bg-base-300 text-base-content/60 border border-base-300" },
  NO_SHOW:   { label: "No asistió", cls: "badge-ghost",    calCls: "bg-base-300 text-base-content/40 border border-base-300" },
};

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all",       label: "Todas" },
  { key: "pending",   label: "Pendientes" },
  { key: "confirmed", label: "Confirmadas" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const personName = (p: IAppointmentParticipant["person"]) =>
  [p.given_name, p.paternal_surname].filter(Boolean).join(" ") || p.person_internal_id || p.id;

const formatDT = (iso: string) =>
  new Date(iso).toLocaleString("es-MX", {
    weekday: "short", day: "numeric", month: "short",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true });

/** Build a Monday-based calendar grid for the given year/month. */
const buildCalendarGrid = (year: number, month: number): (number | null)[] => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const startOffset = (firstDay + 6) % 7;             // convert to Mon-based
  const cells: (number | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

// ── Props ─────────────────────────────────────────────────────────────────────

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
  onAvailability: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const AppointmentsList = ({
  appointments, loading, error, viewYear, viewMonth, onPrev, onNext, onAdd,
  personId, onReload, onSelect, onAvailability,
}: Props) => {
  const now = new Date();
  const isCurrentMonth = viewYear === now.getFullYear() && viewMonth === now.getMonth();

  const [view,        setView]        = useState<ViewType>("list");
  const [filter,      setFilter]      = useState<FilterType>("all");
  const [confirmingId,   setConfirmingId]   = useState<string | null>(null);
  const [cancellingId,   setCancellingId]   = useState<string | null>(null);
  const [deletingId,     setDeletingId]     = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ── Filter counts ──────────────────────────────────────────────────────────
  const countFor = (f: FilterType) => {
    if (f === "pending")   return appointments.filter(a => a.status === "PENDING").length;
    if (f === "confirmed") return appointments.filter(a => a.status === "CONFIRMED").length;
    return appointments.length;
  };

  const filteredAppointments = useMemo(() => {
    if (filter === "pending")   return appointments.filter(a => a.status === "PENDING");
    if (filter === "confirmed") return appointments.filter(a => a.status === "CONFIRMED");
    return appointments;
  }, [appointments, filter]);

  // ── Calendar ───────────────────────────────────────────────────────────────
  const calendarCells = useMemo(() => buildCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const appointmentsByDay = useMemo(() => {
    const map: Record<number, IAppointmentRead[]> = {};
    filteredAppointments.forEach(appt => {
      if (!appt.scheduled_start) return; // proposed-slot appointments have no date yet
      const d = new Date(appt.scheduled_start).getDate();
      if (!map[d]) map[d] = [];
      map[d].push(appt);
    });
    return map;
  }, [filteredAppointments]);

  // ── Helpers ────────────────────────────────────────────────────────────────
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

  const handleDeleteAppointment = async (appointmentId: string) => {
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;
    setDeletingId(appointmentId);
    try {
      await deleteAppointment({ schoolId, appointmentId });
      setConfirmDeleteId(null);
      onReload();
    } finally {
      setDeletingId(null);
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-3">
          {/* Left: title + add */}
          <div className="flex items-center gap-2">
            <span className="iconify lucide--calendar-clock size-5 text-primary" />
            <h2 className="card-title text-xl">Mis Citas</h2>
            <button
              className="btn btn-primary btn-sm btn-circle ml-1"
              title="Nueva cita"
              onClick={onAdd}
            >
              <span className="iconify lucide--plus size-4" />
            </button>
          </div>

          {/* Right: Disponibilidad */}
          <button
            className="btn btn-sm btn-ghost gap-1.5 text-base-content/60 hover:text-base-content"
            title="Configurar disponibilidad"
            onClick={onAvailability}
          >
            <span className="iconify lucide--settings-2 size-4" />
            <span className="hidden sm:inline text-sm">Disponibilidad</span>
          </button>
        </div>

        {/* ── Filter tabs + view controls ──────────────────────────────────── */}
        <div className="flex items-center gap-1.5 mb-4">
          {FILTERS.map(({ key, label }) => {
            const count = countFor(key);
            return (
              <button
                key={key}
                className={`btn btn-sm rounded-full gap-1.5 ${
                  filter === key ? "btn-primary" : "btn-ghost bg-base-200"
                }`}
                onClick={() => setFilter(key)}
              >
                {label}
                <span className={`badge badge-xs ${filter === key ? "badge-primary-content bg-white/20" : "badge-ghost"}`}>
                  {count}
                </span>
              </button>
            );
          })}

          <div className="flex-1" />

          {/* View toggle */}
          <div className="flex items-center bg-base-200 rounded-lg p-0.5 gap-0.5">
            <button
              className={`btn btn-xs btn-ghost ${view === "list" ? "btn-active" : ""}`}
              title="Vista lista"
              onClick={() => setView("list")}
            >
              <span className="iconify lucide--list size-4" />
            </button>
            <button
              className={`btn btn-xs btn-ghost ${view === "calendar" ? "btn-active" : ""}`}
              title="Vista calendario"
              onClick={() => setView("calendar")}
            >
              <span className="iconify lucide--calendar-days size-4" />
            </button>
          </div>

          {/* Month nav */}
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

        {/* ── Loading ─────────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {!loading && error && (
          <div className="alert alert-error">
            <span className="iconify lucide--alert-circle size-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ── Empty state ─────────────────────────────────────────────── */}
            {filteredAppointments.length === 0 && (
              <div className="text-center py-14">
                <span className="iconify lucide--calendar-x size-14 text-base-content/20 block mx-auto mb-3" />
                <p className="text-base-content/50 text-sm">
                  {appointments.length === 0
                    ? `Sin citas para ${MONTH_NAMES[viewMonth]} ${viewYear}.`
                    : "Sin citas que coincidan con el filtro."}
                </p>
              </div>
            )}

            {filteredAppointments.length > 0 && (
              <>
                {/* ──────────────── LIST VIEW ────────────────────────────── */}
                {view === "list" && (
                  <div className="space-y-3">
                    {filteredAppointments.map((appt) => {
                      const status = STATUS_CONFIG[appt.status] ?? { label: appt.status, cls: "badge-ghost" };
                      const hasDates = !!appt.scheduled_start;
                      const start = hasDates ? new Date(appt.scheduled_start) : null;
                      const activeParticipants = appt.participants.filter((p) => !p.removed_at);
                      const others = activeParticipants.filter((p) => p.role !== "ORGANIZER");
                      const myParticipant = findMyParticipant(appt);
                      const amOrganizer = isOrganizer(appt);
                      const isConfirming = confirmingId === appt.id;
                      const isCancelling = cancellingId === appt.id;
                      const needsAction = myParticipant?.status === "PENDING";
                      const needsSlotPick = appt.status !== "CONFIRMED" && !hasDates && (appt.proposed_slots?.length ?? 0) > 0;
                      const canCancelAppt = amOrganizer &&
                        appt.status !== "CANCELLED" && appt.status !== "COMPLETED";

                      return (
                        <div
                          key={appt.id}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:brightness-95 transition-[filter] ${
                            needsAction ? "bg-warning/10 border border-warning/30" : "bg-base-200"
                          }`}
                          onClick={() => onSelect(appt)}
                        >
                          {/* Date block */}
                          {hasDates ? (
                            <div className="shrink-0 w-12 flex flex-col items-center justify-center gap-0.5 bg-base-100 rounded-lg p-1.5 min-h-[3rem]">
                              <p className="text-lg font-bold leading-none">{start!.getDate()}</p>
                              <p className="text-xs text-base-content/50 uppercase leading-none">
                                {MONTH_NAMES[start!.getMonth()].slice(0, 3)}
                              </p>
                            </div>
                          ) : (
                            <div className="shrink-0 w-12 flex items-center justify-center bg-base-100 rounded-lg p-1.5 min-h-[3rem]">
                              <span className="iconify lucide--alarm-clock size-5 text-base-content/50" />
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`badge badge-sm ${status.cls}`}>{status.label}</span>
                              {appt.title && (
                                <span className="text-sm font-semibold truncate">{appt.title}</span>
                              )}
                            </div>

                            {!hasDates ? (
                              <p className="text-sm text-info/80">
                                <span className="iconify lucide--alarm-clock size-3.5 inline mr-1" />
                                {(appt.proposed_slots?.length ?? 0) > 0
                                  ? `${appt.proposed_slots!.length} horario${appt.proposed_slots!.length !== 1 ? "s" : ""} propuesto${appt.proposed_slots!.length !== 1 ? "s" : ""}`
                                  : "Esperando selección de horario"
                                }
                              </p>
                            ) : appt.without_time ? (
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

                            {canCancelAppt && (
                              <div className="mt-2 pt-2 border-t border-base-200 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <span className="badge badge-sm badge-outline text-base-content/50">
                                  <span className="iconify lucide--shield size-3.5 mr-0.5" />
                                  Organizador
                                </span>
                                <span className="flex-1" />
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

                            {myParticipant && (
                              <div className="mt-2 pt-2 border-t border-base-200 flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                                {myParticipant.status === "PENDING" && (
                                  needsSlotPick ? (
                                    <>
                                      <span className="text-xs text-info font-medium flex-1">
                                        <span className="iconify lucide--alarm-clock size-3.5 inline mr-1" />
                                        Horarios propuestos disponibles
                                      </span>
                                      <button
                                        className="btn btn-xs btn-info"
                                        onClick={(e) => { e.stopPropagation(); onSelect(appt); }}
                                      >
                                        <span className="iconify lucide--alarm-clock size-3" />
                                        Elegir horario
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-xs text-warning font-medium flex-1">
                                        <span className="iconify lucide--clock-alert size-3.5 inline mr-1" />
                                        Pendiente de confirmación
                                      </span>
                                      <button className="btn btn-xs btn-success" disabled={isConfirming} onClick={() => handleStatusUpdate(appt.id, "CONFIRMED")}>
                                        {isConfirming ? <span className="loading loading-spinner loading-xs" /> : <><span className="iconify lucide--check size-3" /> Confirmar</>}
                                      </button>
                                      <button className="btn btn-xs btn-outline btn-error" disabled={isConfirming} onClick={() => handleStatusUpdate(appt.id, "DECLINED")}>
                                        Declinar
                                      </button>
                                    </>
                                  )
                                )}
                                {myParticipant.status === "CONFIRMED" && (
                                  <>
                                    <span className="text-xs text-success font-medium flex-1">
                                      <span className="iconify lucide--check-circle size-3.5 inline mr-1" />
                                      Asistencia confirmada
                                    </span>
                                    <button className="btn btn-xs btn-ghost text-error" disabled={isConfirming} onClick={() => handleStatusUpdate(appt.id, "CANCELLED")}>
                                      {isConfirming ? <span className="loading loading-spinner loading-xs" /> : "Cancelar asistencia"}
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
                                      <button className="btn btn-xs btn-outline btn-success" disabled={isConfirming} onClick={() => handleStatusUpdate(appt.id, "CONFIRMED")}>
                                        {isConfirming ? <span className="loading loading-spinner loading-xs" /> : "Reconsiderar"}
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
                                      <button className="btn btn-xs btn-outline" disabled={isConfirming} onClick={() => handleStatusUpdate(appt.id, "CONFIRMED")}>
                                        {isConfirming ? <span className="loading loading-spinner loading-xs" /> : "Reinscribirse"}
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Delete button — organizer only */}
                          {amOrganizer && (
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs btn-circle text-base-content/25 hover:text-error shrink-0 self-start"
                              title="Eliminar cita"
                              disabled={deletingId === appt.id}
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(appt.id); }}
                            >
                              {deletingId === appt.id
                                ? <span className="loading loading-spinner loading-xs" />
                                : <span className="iconify lucide--trash-2 size-3.5" />
                              }
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ──────────────── CALENDAR VIEW ────────────────────────── */}
                {view === "calendar" && (
                  <div>
                    {/* Day headers */}
                    <div className="grid grid-cols-7 mb-1">
                      {DAY_HEADERS.map((d) => (
                        <div key={d} className="text-center text-xs font-semibold text-base-content/40 py-1 uppercase tracking-wide">
                          {d}
                        </div>
                      ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarCells.map((day, i) => {
                        if (!day) return <div key={i} className="rounded-lg" />;
                        const dayAppts = appointmentsByDay[day] ?? [];
                        const isToday = isCurrentMonth && day === now.getDate();
                        return (
                          <div
                            key={i}
                            className={`min-h-[5rem] p-1 rounded-lg border ${
                              isToday
                                ? "border-primary bg-primary/5"
                                : "border-base-200 bg-base-100"
                            }`}
                          >
                            {/* Day number */}
                            <p className={`text-xs font-bold mb-1 leading-none ${
                              isToday ? "text-primary" : "text-base-content/60"
                            }`}>
                              {day}
                            </p>

                            {/* Appointment chips */}
                            {dayAppts.slice(0, 3).map((appt) => {
                              const calCls = STATUS_CONFIG[appt.status]?.calCls ?? "bg-base-200 text-base-content/60";
                              return (
                                <button
                                  key={appt.id}
                                  className={`w-full text-left text-[10px] leading-tight px-1 py-0.5 rounded mb-0.5 truncate block ${calCls}`}
                                  onClick={() => onSelect(appt)}
                                >
                                  {appt.without_time
                                    ? (appt.title ?? "Sin título")
                                    : `${new Date(appt.scheduled_start).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true })} ${appt.title ?? ""}`
                                  }
                                </button>
                              );
                            })}
                            {dayAppts.length > 3 && (
                              <p className="text-[10px] text-base-content/40 pl-1">
                                +{dayAppts.length - 3} más
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

      </div>

      {/* ── Delete confirmation modal ──────────────────────────────────────── */}
      {confirmDeleteId && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                <span className="iconify lucide--trash-2 size-5 text-error" />
              </div>
              <h3 className="font-bold text-lg">Eliminar cita</h3>
            </div>
            <p className="text-sm text-base-content/70 mb-2">
              ¿Estás seguro de que deseas eliminar esta cita?
            </p>
            <p className="text-sm text-base-content/50 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-ghost"
                onClick={() => setConfirmDeleteId(null)}
                disabled={deletingId === confirmDeleteId}
              >
                Cancelar
              </button>
              <button
                className="btn btn-error"
                onClick={() => handleDeleteAppointment(confirmDeleteId)}
                disabled={deletingId === confirmDeleteId}
              >
                {deletingId === confirmDeleteId
                  ? <><span className="loading loading-spinner loading-sm" /> Eliminando…</>
                  : <><span className="iconify lucide--trash-2 size-4" /> Eliminar</>
                }
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => { if (!deletingId) setConfirmDeleteId(null); }}
          />
        </div>
      )}
    </div>
  );
};
