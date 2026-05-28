"use client";

import { useState } from "react";
import { TimePicker } from "@/components/TimePicker";
import { IAppointmentRead, AppointmentStatus, IAppointmentParticipant } from "@/interfaces/IAppointment";
import {
  updateAppointment,
  updateAppointmentStatus,
  updateParticipantStatus,
} from "@/services/appointment.service";
import { getOrgConfig } from "@/lib/orgConfig";
import { getApiErrorMessage } from "@/lib/apiError";

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; cls: string }> = {
  PENDING:   { label: "Pendiente",  cls: "badge-warning" },
  CONFIRMED: { label: "Confirmada", cls: "badge-success" },
  CANCELLED: { label: "Cancelada",  cls: "badge-error" },
  COMPLETED: { label: "Completada", cls: "badge-neutral" },
  NO_SHOW:   { label: "No asistió", cls: "badge-ghost" },
};

const PARTICIPANT_STATUS_CONFIG = {
  PENDING:   { label: "Pendiente",  cls: "badge-warning" },
  CONFIRMED: { label: "Confirmado", cls: "badge-success" },
  DECLINED:  { label: "Declinado",  cls: "badge-error" },
  CANCELLED: { label: "Cancelado",  cls: "badge-ghost" },
} as const;

const personName = (p: IAppointmentParticipant["person"]) =>
  [p.given_name, p.paternal_surname].filter(Boolean).join(" ") || p.person_internal_id || p.id;

const toDateStr = (iso: string) => iso.slice(0, 10);
const toTimeStr = (iso: string) => iso.slice(11, 16);

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("es-MX", {
    weekday: "long", day: "numeric", month: "long",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-MX", {
    weekday: "long", day: "numeric", month: "long",
  });

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-MX", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

const todayISO = () => new Date().toISOString().slice(0, 10);

const isValidUrl = (v: string) => { try { new URL(v); return true; } catch { return false; } };

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  appointment: IAppointmentRead;
  personId: string | null;
  onClose: () => void;
  onUpdate: () => void;
}

export const AppointmentDetailModal = ({ appointment: appt, personId, onClose, onUpdate }: Props) => {
  const amOrganizer = !!personId && String(appt.host_person_id) === String(personId);

  // Any participant entry for the current user (organizer or attendee)
  const myEntry = personId
    ? appt.participants.find(
        (p) => String(p.person_id) === String(personId) && !p.removed_at
      ) ?? null
    : null;

  // Only ATTENDEE entry — used for participation action buttons
  const myParticipant = myEntry?.role === "ATTENDEE" ? myEntry : null;

  const myPersonType = myEntry?.person.type ?? null;
  const canEdit = ["USER", "TEACHER"].includes(myPersonType ?? "") || appt.without_time;

  const canCancelAppt =
    amOrganizer && appt.status !== "CANCELLED" && appt.status !== "COMPLETED";

  // ── Edit state ───────────────────────────────────────────────────────────────
  const [startDate, setStartDate] = useState(
    appt.without_time ? todayISO() : toDateStr(appt.scheduled_start)
  );
  const [startTime, setStartTime] = useState(
    appt.without_time ? "09:00" : toTimeStr(appt.scheduled_start)
  );
  const [endDate, setEndDate] = useState(
    appt.without_time ? todayISO() : toDateStr(appt.scheduled_end)
  );
  const [endTime, setEndTime] = useState(
    appt.without_time ? "09:30" : toTimeStr(appt.scheduled_end)
  );
  const [location, setLocation] = useState(appt.location ?? "");
  const [editingLocation, setEditingLocation] = useState(!appt.location);
  const [virtualLink, setVirtualLink] = useState(appt.virtual_link ?? "");
  const [editingVirtualLink, setEditingVirtualLink] = useState(!appt.virtual_link);
  const [notes, setNotes] = useState(appt.notes ?? "");
  const [notesExpanded, setNotesExpanded] = useState(!!appt.notes);
  // Open schedule inputs immediately only when there's no time set yet
  const [editingSchedule, setEditingSchedule] = useState(appt.without_time);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── Action state ─────────────────────────────────────────────────────────────
  const [confirmingStatus, setConfirmingStatus] = useState(false);
  const [cancellingAppt, setCancellingAppt] = useState(false);

  const activeParticipants = appt.participants.filter((p) => !p.removed_at);
  const status = STATUS_CONFIG[appt.status] ?? { label: appt.status, cls: "badge-ghost" };

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;

    const start = new Date(`${startDate}T${startTime}:00`).toISOString();
    const end = new Date(`${endDate}T${endTime}:00`).toISOString();
    const duration = Math.max(
      0,
      Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000)
    );

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await updateAppointment({
        schoolId,
        appointmentId: appt.id,
        dto: {
          scheduled_start: start,
          scheduled_end: end,
          duration_minutes: duration,
          without_time: false,
          location: location.trim() || null,
          virtual_link: virtualLink.trim() || null,
          notes: notes.trim() || null,
        },
      });
      setSaveSuccess(true);
      onUpdate();
    } catch (err) {
      setSaveError(getApiErrorMessage(err, "No se pudo guardar. Intenta de nuevo."));
    } finally {
      setSaving(false);
    }
  };

  // ── Participant status ────────────────────────────────────────────────────────
  const handleParticipantStatus = async (s: "CONFIRMED" | "DECLINED" | "CANCELLED") => {
    if (!personId) return;
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;
    setConfirmingStatus(true);
    try {
      await updateParticipantStatus({ schoolId, appointmentId: appt.id, personId, status: s });
      onUpdate();
    } finally {
      setConfirmingStatus(false);
    }
  };

  // ── Cancel appointment ────────────────────────────────────────────────────────
  const handleCancelAppointment = async () => {
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;
    setCancellingAppt(true);
    try {
      await updateAppointmentStatus({ schoolId, appointmentId: appt.id, status: "CANCELLED" });
      onUpdate();
    } finally {
      setCancellingAppt(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg flex flex-col" style={{ maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-start justify-between mb-4 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="iconify lucide--calendar-clock size-4 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">
                {appt.title ?? "Cita sin título"}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`badge badge-sm ${status.cls}`}>{status.label}</span>
                {appt.without_time && !saveSuccess && (
                  <span className="badge badge-sm badge-outline">Horario abierto</span>
                )}
                {amOrganizer ? (
                  <span className="badge badge-sm badge-outline">
                    <span className="iconify lucide--shield size-3 mr-1" />
                    Organizador
                  </span>
                ) : myParticipant ? (
                  <span className="badge badge-sm badge-outline">
                    <span className="iconify lucide--user size-3 mr-1" />
                    Asistente
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost shrink-0 ml-2" onClick={onClose}>
            <span className="iconify lucide--x size-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">

          {/* Date / time */}
          {!appt.without_time && (
            <div className="flex items-start gap-2 text-sm">
              <span className="iconify lucide--clock size-4 text-base-content/40 mt-0.5 shrink-0" />
              <div className="flex-1">
                {toDateStr(appt.scheduled_start) === toDateStr(appt.scheduled_end) ? (
                  /* Same day — compact single-line format */
                  <p>
                    {fmtDate(appt.scheduled_start)},{" "}
                    {fmtTime(appt.scheduled_start)} – {fmtTime(appt.scheduled_end)}
                    <span className="ml-2 text-xs text-base-content/50">({appt.duration_minutes} min)</span>
                  </p>
                ) : (
                  /* Multi-day — keep "hasta..." two-line format */
                  <>
                    <p>{fmtDateTime(appt.scheduled_start)}</p>
                    <p className="text-base-content/50">
                      hasta {fmtDateTime(appt.scheduled_end)}
                      <span className="ml-2 text-xs">({appt.duration_minutes} min)</span>
                    </p>
                  </>
                )}
              </div>
              {canEdit && !editingSchedule && (
                <button
                  type="button"
                  className="btn btn-xs btn-ghost gap-1 shrink-0 -mt-0.5"
                  onClick={() => setEditingSchedule(true)}
                >
                  <span className="iconify lucide--pencil size-3" />
                  Cambiar
                </button>
              )}
            </div>
          )}

          {/* Description — always read-only, right after schedule */}
          {appt.description && (
            <div className="flex items-start gap-2 text-sm">
              <span className="iconify lucide--align-left size-4 text-base-content/40 mt-0.5 shrink-0" />
              <p className="text-base-content/70">{appt.description}</p>
            </div>
          )}

          {/* Location */}
          {canEdit ? (
            <div className="flex items-start gap-2 text-sm">
              <span className="iconify lucide--map-pin size-4 text-base-content/40 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                {editingLocation ? (
                  <div className="relative">
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full pr-16"
                      placeholder="Salón 3B, Sala de juntas…"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onBlur={() => setEditingLocation(false)}
                      autoFocus
                    />
                    {appt.location && (
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-base-content/40 hover:text-base-content/70"
                        onMouseDown={(e) => { e.preventDefault(); setLocation(appt.location ?? ""); setEditingLocation(false); }}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                ) : location ? (
                  <div className="flex items-center gap-2">
                    <span className="flex-1 truncate">{location}</span>
                    <button type="button" className="btn btn-xs btn-ghost shrink-0" onClick={() => setEditingLocation(true)}>
                      <span className="iconify lucide--pencil size-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-base-content/40 flex-1">Sin datos de ubicación</span>
                    <button type="button" className="btn btn-xs btn-ghost gap-1 shrink-0" onClick={() => setEditingLocation(true)}>
                      <span className="iconify lucide--pencil size-3" />
                      Cambiar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : appt.location ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="iconify lucide--map-pin size-4 text-base-content/40 shrink-0" />
              <span>{appt.location}</span>
            </div>
          ) : null}

          {/* Virtual link */}
          {canEdit ? (
            <div className="flex items-start gap-2 text-sm">
              <span className="iconify lucide--video size-4 text-base-content/40 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                {editingVirtualLink ? (
                  <div className="relative">
                    <input
                      type="url"
                      className="input input-bordered input-sm w-full pr-16"
                      placeholder="https://meet.google.com/…"
                      value={virtualLink}
                      onChange={(e) => setVirtualLink(e.target.value)}
                      onBlur={() => setEditingVirtualLink(false)}
                      autoFocus
                    />
                    {appt.virtual_link && (
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-base-content/40 hover:text-base-content/70"
                        onMouseDown={(e) => { e.preventDefault(); setVirtualLink(appt.virtual_link ?? ""); setEditingVirtualLink(false); }}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                ) : virtualLink ? (
                  <div className="flex items-center gap-2">
                    {isValidUrl(virtualLink) ? (
                      <a
                        href={virtualLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link link-primary flex-1 truncate"
                      >
                        Unirse a reunión virtual
                      </a>
                    ) : (
                      <span className="flex-1 truncate">{virtualLink}</span>
                    )}
                    <button type="button" className="btn btn-xs btn-ghost shrink-0" onClick={() => setEditingVirtualLink(true)}>
                      <span className="iconify lucide--pencil size-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-base-content/40 flex-1">Sin enlace virtual</span>
                    <button type="button" className="btn btn-xs btn-ghost gap-1 shrink-0" onClick={() => setEditingVirtualLink(true)}>
                      <span className="iconify lucide--pencil size-3" />
                      Cambiar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : appt.virtual_link ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="iconify lucide--video size-4 text-base-content/40 shrink-0" />
              <a href={appt.virtual_link} target="_blank" rel="noopener noreferrer" className="link link-primary truncate">
                Unirse a reunión virtual
              </a>
            </div>
          ) : null}

          {/* Notes (read-only when not editing) — collapsible */}
          {!canEdit && (
            <div>
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs text-base-content/50 hover:text-base-content/80 transition-colors"
                onClick={() => setNotesExpanded((v) => !v)}
              >
                <span className={`iconify size-3.5 transition-transform ${notesExpanded ? "lucide--chevron-down" : "lucide--chevron-right"}`} />
                <span className="iconify lucide--notebook size-3.5" />
                {notesExpanded ? "Ocultar notas" : appt.notes ? "Ver notas" : "Sin notas"}
              </button>
              {notesExpanded && appt.notes && (
                <p className="mt-2 text-sm text-base-content/70 pl-5">{appt.notes}</p>
              )}
              {notesExpanded && !appt.notes && (
                <p className="mt-2 text-xs text-base-content/40 pl-5 italic">Sin notas.</p>
              )}
            </div>
          )}

          {/* Participants */}
          {activeParticipants.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-2">
                Participantes
              </p>
              <div className="space-y-1.5">
                {activeParticipants.map((p) => {
                  const pStatus = PARTICIPANT_STATUS_CONFIG[p.status as keyof typeof PARTICIPANT_STATUS_CONFIG]
                    ?? { label: p.status, cls: "badge-ghost" };
                  return (
                    <div key={p.person_id} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-base-300 flex items-center justify-center shrink-0">
                        <span className="iconify lucide--user size-3 text-base-content/50" />
                      </div>
                      <span className="text-sm flex-1 truncate">{personName(p.person)}</span>
                      <span className="badge badge-xs badge-outline opacity-60 w-[5.5rem] justify-center shrink-0">{p.role === "ORGANIZER" ? "Organizador" : "Asistente"}</span>
                      <span className={`badge badge-xs w-[5rem] justify-center shrink-0 ${pStatus.cls}`}>{pStatus.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Action rows ──────────────────────────────────────────────────── */}

          {/* Organizer — cancel appointment */}
          {canCancelAppt && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200">
              <span className="text-sm text-base-content/60 flex-1">
                <span className="iconify lucide--shield size-4 inline mr-1.5" />
                Acción del organizador
              </span>
              <button
                className="btn btn-sm btn-outline btn-error"
                disabled={cancellingAppt}
                onClick={handleCancelAppointment}
              >
                {cancellingAppt
                  ? <span className="loading loading-spinner loading-xs" />
                  : <><span className="iconify lucide--x size-3.5" /> Cancelar cita</>
                }
              </button>
            </div>
          )}

          {/* Participant — status actions */}
          {myParticipant && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-base-200 flex-wrap">
              {myParticipant.status === "PENDING" && (
                <>
                  <span className="text-sm text-warning font-medium flex-1">
                    <span className="iconify lucide--clock-alert size-4 inline mr-1.5" />
                    Pendiente de confirmación
                  </span>
                  <button
                    className="btn btn-sm btn-success"
                    disabled={confirmingStatus}
                    onClick={() => handleParticipantStatus("CONFIRMED")}
                  >
                    {confirmingStatus
                      ? <span className="loading loading-spinner loading-xs" />
                      : <><span className="iconify lucide--check size-3.5" /> Confirmar</>
                    }
                  </button>
                  <button
                    className="btn btn-sm btn-outline btn-error"
                    disabled={confirmingStatus}
                    onClick={() => handleParticipantStatus("DECLINED")}
                  >
                    Declinar
                  </button>
                </>
              )}

              {myParticipant.status === "CONFIRMED" && (
                <>
                  <span className="text-sm text-success font-medium flex-1">
                    <span className="iconify lucide--check-circle size-4 inline mr-1.5" />
                    Asistencia confirmada
                  </span>
                  <button
                    className="btn btn-sm btn-ghost text-error"
                    disabled={confirmingStatus}
                    onClick={() => handleParticipantStatus("CANCELLED")}
                  >
                    {confirmingStatus
                      ? <span className="loading loading-spinner loading-xs" />
                      : "Cancelar asistencia"
                    }
                  </button>
                </>
              )}

              {myParticipant.status === "DECLINED" && (
                <>
                  <span className="text-sm text-base-content/50 flex-1">
                    <span className="iconify lucide--x-circle size-4 inline mr-1.5" />
                    Asistencia declinada
                  </span>
                  {appt.status !== "CANCELLED" && (
                    <button
                      className="btn btn-sm btn-outline btn-success"
                      disabled={confirmingStatus}
                      onClick={() => handleParticipantStatus("CONFIRMED")}
                    >
                      {confirmingStatus
                        ? <span className="loading loading-spinner loading-xs" />
                        : "Reconsiderar"
                      }
                    </button>
                  )}
                </>
              )}

              {myParticipant.status === "CANCELLED" && (
                <>
                  <span className="text-sm text-base-content/40 flex-1">
                    <span className="iconify lucide--ban size-4 inline mr-1.5" />
                    Participación cancelada
                  </span>
                  {appt.status !== "CANCELLED" && (
                    <button
                      className="btn btn-sm btn-outline"
                      disabled={confirmingStatus}
                      onClick={() => handleParticipantStatus("CONFIRMED")}
                    >
                      {confirmingStatus
                        ? <span className="loading loading-spinner loading-xs" />
                        : "Reinscribirse"
                      }
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Edit section ────────────────────────────────────────────────── */}
          {canEdit && (
            <div className="border-t border-base-200 pt-4 space-y-3">
              {/* Scheduling inputs — shown when without_time (always) or after clicking Cambiar */}
              {editingSchedule && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">
                      {appt.without_time ? "Establecer horario" : "Editar horario"}
                    </p>
                    {!appt.without_time && (
                      <button
                        type="button"
                        className="text-xs link link-ghost text-base-content/40 hover:text-base-content/70"
                        onClick={() => setEditingSchedule(false)}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>

                  {/* Start */}
                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text text-sm font-medium">Inicio</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1 min-w-0">
                        <span className="iconify lucide--calendar size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
                        <input
                          type="date"
                          className="input input-bordered input-sm w-full pl-9"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          min={todayISO()}
                        />
                      </div>
                      <TimePicker value={startTime} onChange={setStartTime} />
                    </div>
                  </div>

                  {/* End */}
                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text text-sm font-medium">Fin</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1 min-w-0">
                        <span className="iconify lucide--calendar size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
                        <input
                          type="date"
                          className="input input-bordered input-sm w-full pl-9"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          min={startDate}
                        />
                      </div>
                      <TimePicker value={endTime} onChange={setEndTime} />
                    </div>
                  </div>
                </>
              )}

              {/* Notes — collapsible */}
              <div>
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs text-base-content/50 hover:text-base-content/80 transition-colors"
                  onClick={() => setNotesExpanded((v) => !v)}
                >
                  <span className={`iconify size-3.5 transition-transform ${notesExpanded ? "lucide--chevron-down" : "lucide--chevron-right"}`} />
                  <span className="iconify lucide--notebook size-3.5" />
                  {notesExpanded ? "Ocultar notas" : notes ? "Ver / editar notas" : "Agregar notas"}
                </button>

                {notesExpanded && (
                  <div className="form-control mt-2 w-full">
                    <textarea
                      className="textarea textarea-bordered resize-none text-sm w-full"
                      rows={6}
                      placeholder="Notas internas sobre esta cita…"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {saveError && (
                <div className="alert alert-error py-2">
                  <span className="iconify lucide--alert-circle size-4" />
                  <span className="text-sm">{saveError}</span>
                </div>
              )}

              {saveSuccess && (
                <div className="alert alert-success py-2">
                  <span className="iconify lucide--check-circle size-4" />
                  <span className="text-sm">Guardado correctamente.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-4 shrink-0 pt-2 border-t border-base-200">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cerrar</button>
          {canEdit && (
            <button
              className="btn btn-primary btn-sm"
              disabled={saving || !startDate || !startTime || !endDate || !endTime}
              onClick={handleSave}
            >
              {saving
                ? <><span className="loading loading-spinner loading-xs" /> Guardando…</>
                : <><span className="iconify lucide--save size-4" /> Guardar</>
              }
            </button>
          )}
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
};
