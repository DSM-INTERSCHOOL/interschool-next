"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSchoolStore } from "@/store/useSchoolStore";
import { TimePicker } from "@/components/TimePicker";
import { IAppointmentRead, AppointmentStatus, IAppointmentParticipant, IAppointmentRecipient } from "@/interfaces/IAppointment";
import {
  updateAppointment,
  updateAppointmentStatus,
  updateParticipantStatus,
  addParticipant,
  removeParticipant,
  addProposedSlot,
} from "@/services/appointment.service";
import { getAppointmentRecipients } from "@/services/auth.service";
import { getOrgConfig } from "@/lib/orgConfig";
import { getApiErrorMessage } from "@/lib/apiError";

// ── Participant picker constants (mirrors NewAppointmentModal) ────────────────

const PAGE_LIMIT = 20;

const TYPE_CONFIG: Record<string, {
  label: string;
  icon: string;
  activeCard: string;
  avatar: string;
  badge: string;
}> = {
  USER:     { label: "Usuario",   icon: "lucide--user",           activeCard: "border-accent   bg-accent/10   text-accent",      avatar: "bg-accent/15   text-accent",      badge: "badge-accent"    },
  STUDENT:  { label: "Alumno",    icon: "lucide--graduation-cap", activeCard: "border-primary  bg-primary/10  text-primary",     avatar: "bg-primary/15  text-primary",     badge: "badge-primary"   },
  TEACHER:  { label: "Profesor",  icon: "lucide--user-check",     activeCard: "border-secondary bg-secondary/10 text-secondary", avatar: "bg-secondary/15 text-secondary",  badge: "badge-secondary" },
  RELATIVE: { label: "Familiar",  icon: "lucide--heart",          activeCard: "border-success  bg-success/10  text-success",     avatar: "bg-success/15  text-success",     badge: "badge-success"   },
  ACADEMIC: { label: "Académico", icon: "lucide--book-open",      activeCard: "border-warning  bg-warning/10  text-warning",     avatar: "bg-warning/15  text-warning",     badge: "badge-warning"   },
};

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
const nowTimeHHMM = () => {
  const n = new Date();
  return `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
};

const isValidUrl = (v: string) => { try { new URL(v); return true; } catch { return false; } };

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  appointment: IAppointmentRead;
  personId: string | null;
  onClose: () => void;
  onUpdate: () => void;
}

export const AppointmentDetailModal = ({ appointment: appt, personId, onClose, onUpdate }: Props) => {
  const { personType } = useAuth();
  const school = useSchoolStore((s) => s.school);

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

  const canAddParticipants = canEdit && appt.status !== "CANCELLED" && appt.status !== "COMPLETED";

  // ── Edit state ───────────────────────────────────────────────────────────────
  const [startDate, setStartDate] = useState(
    appt.without_time ? todayISO() : toDateStr(appt.scheduled_start)
  );
  const [startTime, setStartTime] = useState(
    appt.without_time ? "09:00" : toTimeStr(appt.scheduled_start)
  );
  const [scheduleDuration, setScheduleDuration] = useState<number>(() => {
    if (appt.without_time || !appt.scheduled_start || !appt.scheduled_end) return 30;
    const diff = Math.round(
      (new Date(appt.scheduled_end).getTime() - new Date(appt.scheduled_start).getTime()) / 60_000
    );
    return [15, 30, 45, 60].reduce((a, b) => Math.abs(b - diff) < Math.abs(a - diff) ? b : a);
  });
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

  // ── Add participant state ─────────────────────────────────────────────────────
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const [addType, setAddType] = useState<string | null>(null);
  const [addSearch, setAddSearch] = useState("");
  const [addSkip, setAddSkip] = useState(0);
  const [addRecipients, setAddRecipients] = useState<IAppointmentRecipient[]>([]);
  const [addTotal, setAddTotal] = useState(0);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSelected, setAddSelected] = useState<IAppointmentRecipient | null>(null);
  const [addSaving, setAddSaving] = useState(false);
  const [addSaveError, setAddSaveError] = useState<string | null>(null);
  const prevAddTypeRef = useRef<string | null | undefined>(undefined);
  const prevAddSkipRef = useRef(0);

  const allowedTypes: string[] = (() => {
    if (!personType || !school?.inoty_config?.inoty_appointments_config) return [];
    const cfg = school.inoty_config.inoty_appointments_config[personType];
    if (!cfg) return [];
    return Object.entries(cfg)
      .filter(([, p]) => p !== null && p.allowed_target_groups !== "NONE")
      .map(([t]) => t);
  })();

  const existingPersonIds = new Set(
    appt.participants.filter((p) => !p.removed_at).map((p) => String(p.person_id))
  );

  const hasPrev = addSkip > 0;
  const hasNext = addSkip + PAGE_LIMIT < addTotal;
  const totalPages = Math.ceil(addTotal / PAGE_LIMIT);
  const currentPage = Math.floor(addSkip / PAGE_LIMIT) + 1;

  const fetchAddRecipients = useCallback(async (type: string | null, query: string, skip: number) => {
    if (!personId || !personType) return;
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;
    setAddLoading(true);
    setAddError(null);
    try {
      const result = await getAppointmentRecipients({
        schoolId, personId, personType,
        searchTerm: query, targetPersonType: type,
        skip, limit: PAGE_LIMIT,
      });
      setAddRecipients(result.items);
      setAddTotal(result.total);
    } catch {
      setAddError("Error al cargar personas");
      setAddRecipients([]);
      setAddTotal(0);
    } finally {
      setAddLoading(false);
    }
  }, [personId, personType]);

  useEffect(() => {
    if (!addPanelOpen || allowedTypes.length === 0) return;
    const typeChanged = prevAddTypeRef.current !== addType;
    const skipChanged = prevAddSkipRef.current !== addSkip;
    prevAddTypeRef.current = addType;
    prevAddSkipRef.current = addSkip;
    const delay = typeChanged || skipChanged ? 0 : 400;
    const timer = setTimeout(() => fetchAddRecipients(addType, addSearch, addSkip), delay);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addPanelOpen, addType, addSearch, addSkip, fetchAddRecipients]);

  const handleOpenAddPanel = () => {
    setAddPanelOpen(true);
    setAddType(null);
    setAddSearch("");
    setAddSkip(0);
    setAddSelected(null);
    setAddSaveError(null);
  };

  const handleCloseAddPanel = () => {
    setAddPanelOpen(false);
    setAddSelected(null);
    setAddSaveError(null);
  };

  const handleAddParticipant = async () => {
    if (!addSelected) return;
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;
    setAddSaving(true);
    setAddSaveError(null);
    try {
      await addParticipant({ schoolId, appointmentId: appt.id, personId: String(addSelected.person_id), addedBy: String(personId) });
      handleCloseAddPanel();
      onUpdate();
    } catch (err) {
      setAddSaveError(getApiErrorMessage(err, "No se pudo agregar el participante."));
    } finally {
      setAddSaving(false);
    }
  };

  // ── Proposed-slot flag (derived from school config) ──────────────────────────
  const customSlotEnabled: boolean = (() => {
    if (!myPersonType || !school?.inoty_config?.inoty_appointments_config) return false;
    const cfg = school.inoty_config.inoty_appointments_config[myPersonType];
    if (!cfg) return false;
    const other = appt.participants.find(
      (p) => !p.removed_at && String(p.person_id) !== String(personId)
    );
    if (!other?.person.type) return false;
    return cfg[other.person.type]?.custom_slot_enabled ?? false;
  })();

  // ── Add proposed-slot state ───────────────────────────────────────────────────
  const [slotPanelOpen, setSlotPanelOpen] = useState(false);
  const [slotDate, setSlotDate] = useState(todayISO());
  const [slotStartTime, setSlotStartTime] = useState("09:00");
  const [slotDuration, setSlotDuration] = useState(30);
  const [slotSaving, setSlotSaving] = useState(false);
  const [slotSaveError, setSlotSaveError] = useState<string | null>(null);

  const handleAddProposedSlot = async () => {
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;
    setSlotSaving(true);
    setSlotSaveError(null);
    try {
      await addProposedSlot({
        schoolId,
        appointmentId: appt.id,
        dto: {
          start_datetime: new Date(`${slotDate}T${slotStartTime}:00`).toISOString(),
          end_datetime: new Date(new Date(`${slotDate}T${slotStartTime}:00`).getTime() + slotDuration * 60_000).toISOString(),
        },
      });
      setSlotPanelOpen(false);
      onUpdate();
    } catch (err) {
      setSlotSaveError(getApiErrorMessage(err, "No se pudo agregar el horario."));
    } finally {
      setSlotSaving(false);
    }
  };

  // ── Remove participant state ──────────────────────────────────────────────────
  const [removingPersonId, setRemovingPersonId] = useState<string | null>(null);

  const handleRemoveParticipant = async (pid: string) => {
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;
    setRemovingPersonId(pid);
    try {
      await removeParticipant({ schoolId, appointmentId: appt.id, personId: pid });
      onUpdate();
    } finally {
      setRemovingPersonId(null);
    }
  };

  const activeParticipants = appt.participants.filter((p) => !p.removed_at);
  const status = STATUS_CONFIG[appt.status] ?? { label: appt.status, cls: "badge-ghost" };

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;

    const startMs = new Date(`${startDate}T${startTime}:00`).getTime();
    const start = new Date(startMs).toISOString();
    const end = new Date(startMs + scheduleDuration * 60_000).toISOString();

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
          duration_minutes: scheduleDuration,
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

          {/* ── Proposed slots ──────────────────────────────────────────────── */}
          {appt.status !== "CONFIRMED" && !appt.scheduled_start && ((appt.proposed_slots?.length ?? 0) > 0 || (customSlotEnabled && canEdit)) && (
            <div>
              {/* Section header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="iconify lucide--calendar-range size-4 text-base-content/40 shrink-0" />
                  <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">
                    Horarios propuestos
                  </p>
                </div>
                {customSlotEnabled && canEdit && !slotPanelOpen && (
                  <button
                    type="button"
                    className="btn btn-xs btn-ghost gap-1 text-base-content/50 hover:text-primary"
                    onClick={() => {
                      setSlotDate(todayISO());
                      setSlotStartTime("09:00");
                      setSlotDuration(30);
                      setSlotSaveError(null);
                      setSlotPanelOpen(true);
                    }}
                  >
                    <span className="iconify lucide--plus size-3.5" />
                    Agregar
                  </button>
                )}
              </div>

              {/* Existing slots */}
              {(appt.proposed_slots?.length ?? 0) > 0 && (
                <div className="space-y-1 mb-2">
                  {appt.proposed_slots!.map((slot, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-base-content/70">
                      <span className="iconify lucide--clock size-3.5 text-base-content/35 shrink-0" />
                      <span>
                        {fmtDate(slot.start_datetime)},{" "}
                        {fmtTime(slot.start_datetime)} – {fmtTime(slot.end_datetime)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {!(appt.proposed_slots?.length) && !slotPanelOpen && (
                <p className="text-sm text-base-content/35 italic">Sin horarios propuestos.</p>
              )}

              {/* Add-slot inline panel */}
              {slotPanelOpen && (
                <div className="mt-2 rounded-xl border border-base-200 bg-base-50 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">
                      Nuevo horario
                    </span>
                    <button
                      type="button"
                      className="btn btn-xs btn-ghost btn-circle"
                      onClick={() => setSlotPanelOpen(false)}
                      disabled={slotSaving}
                    >
                      <span className="iconify lucide--x size-3.5" />
                    </button>
                  </div>

                  {/* Date + Start time + Duration — single row */}
                  <div className="grid items-center gap-2" style={{ gridTemplateColumns: "minmax(8rem, 1fr) auto auto" }}>
                    <div className="relative">
                      <span className="iconify lucide--calendar size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/35 pointer-events-none" />
                      <input
                        type="date"
                        className="input input-bordered input-sm w-full pl-8"
                        value={slotDate}
                        min={todayISO()}
                        onChange={(e) => setSlotDate(e.target.value)}
                      />
                    </div>
                    <TimePicker
                      value={slotStartTime}
                      minTime={slotDate === todayISO() ? nowTimeHHMM() : undefined}
                      onChange={setSlotStartTime}
                    />
                    <select
                      className="select select-bordered select-sm"
                      value={slotDuration}
                      onChange={(e) => setSlotDuration(Number(e.target.value))}
                    >
                      <option value={15}>15 min</option>
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                    </select>
                  </div>

                  {slotSaveError && (
                    <div className="alert alert-error py-2">
                      <span className="iconify lucide--alert-circle size-4" />
                      <span className="text-xs">{slotSaveError}</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-1 border-t border-base-200">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setSlotPanelOpen(false)}
                      disabled={slotSaving}
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={!slotDate || slotSaving}
                      onClick={handleAddProposedSlot}
                    >
                      {slotSaving
                        ? <><span className="loading loading-spinner loading-xs" /> Guardando…</>
                        : <><span className="iconify lucide--check size-4" /> Agregar</>
                      }
                    </button>
                  </div>
                </div>
              )}
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
          <div>
            {/* Section header */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">
                Participantes
              </p>
              {canAddParticipants && !addPanelOpen && (
                <button
                  type="button"
                  className="btn btn-xs btn-ghost gap-1 text-base-content/50 hover:text-primary"
                  onClick={handleOpenAddPanel}
                >
                  <span className="iconify lucide--user-plus size-3.5" />
                  Agregar
                </button>
              )}
            </div>

            {/* Participant rows */}
            {activeParticipants.length > 0 && (
              <div className="space-y-1.5">
                {activeParticipants.map((p) => {
                  const typeCfg = TYPE_CONFIG[p.person.type ?? ""];
                  const pStatus = PARTICIPANT_STATUS_CONFIG[p.status as keyof typeof PARTICIPANT_STATUS_CONFIG]
                    ?? { label: p.status, cls: "badge-ghost" };
                  const isRemoving = removingPersonId === p.person_id;
                  const canRemove = canAddParticipants && p.role !== "ORGANIZER" && String(p.person_id) !== String(personId);
                  return (
                    <div key={p.person_id} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        typeCfg?.avatar ?? "bg-base-300 text-base-content/50"
                      }`}>
                        <span className={`iconify ${typeCfg?.icon ?? "lucide--user"} size-3`} />
                      </div>
                      <span className="text-sm flex-1 truncate">{personName(p.person)}</span>
                      <span className="badge badge-xs badge-outline opacity-60 w-[5.5rem] justify-center shrink-0">{p.role === "ORGANIZER" ? "Organizador" : "Asistente"}</span>
                      <span className={`badge badge-xs w-[5rem] justify-center shrink-0 ${pStatus.cls}`}>{pStatus.label}</span>
                      {canAddParticipants && (
                        canRemove ? (
                          <button
                            type="button"
                            className="btn btn-xs btn-ghost btn-circle text-base-content/30 hover:text-error shrink-0"
                            title="Quitar participante"
                            disabled={isRemoving}
                            onClick={() => handleRemoveParticipant(p.person_id)}
                          >
                            {isRemoving
                              ? <span className="loading loading-spinner loading-xs" />
                              : <span className="iconify lucide--user-minus size-3.5" />
                            }
                          </button>
                        ) : (
                          <span className="w-6 shrink-0" />
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Add-participant inline panel ──────────────────────────────── */}
            {addPanelOpen && (
              <div className="mt-3 rounded-xl border border-base-200 bg-base-50 p-3 space-y-3">

                {/* Panel header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wide">
                    Agregar participante
                  </span>
                  <button
                    type="button"
                    className="btn btn-xs btn-ghost btn-circle"
                    onClick={handleCloseAddPanel}
                    disabled={addSaving}
                  >
                    <span className="iconify lucide--x size-3.5" />
                  </button>
                </div>

                {/* Type filter cards */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => { setAddType(null); setAddSkip(0); setAddSelected(null); }}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg border-2 transition-all min-w-0 ${
                      addType === null
                        ? "border-base-content/50 bg-base-content/8 text-base-content"
                        : "border-base-200 text-base-content/40 hover:border-base-300"
                    }`}
                  >
                    <span className="iconify lucide--search size-4" />
                    <span className="text-[10px] font-semibold">Todos</span>
                  </button>
                  {allowedTypes.map((type) => {
                    const cfg = TYPE_CONFIG[type];
                    const isActive = addType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => { setAddType(type); setAddSkip(0); setAddSelected(null); }}
                        className={`flex-1 flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg border-2 transition-all min-w-0 ${
                          isActive
                            ? cfg?.activeCard ?? "border-primary bg-primary/10 text-primary"
                            : "border-base-200 text-base-content/40 hover:border-base-300"
                        }`}
                      >
                        <span className={`iconify ${cfg?.icon ?? "lucide--user"} size-4`} />
                        <span className="text-[10px] font-semibold truncate w-full text-center">{cfg?.label ?? type}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Search */}
                <div className="relative">
                  <span className="iconify lucide--search size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/35 pointer-events-none" />
                  <input
                    type="text"
                    className="input input-bordered input-sm w-full pl-8 pr-8"
                    placeholder={addType ? `Buscar ${TYPE_CONFIG[addType]?.label ?? addType}…` : "Buscar por nombre o ID…"}
                    value={addSearch}
                    onChange={(e) => { setAddSearch(e.target.value); setAddSkip(0); setAddSelected(null); }}
                  />
                  {addSearch && (
                    <button
                      className="btn btn-ghost btn-xs btn-circle absolute right-1.5 top-1/2 -translate-y-1/2"
                      onClick={() => { setAddSearch(""); setAddSkip(0); setAddSelected(null); }}
                    >
                      <span className="iconify lucide--x size-3" />
                    </button>
                  )}
                </div>

                {/* Recipient list */}
                {addLoading && (
                  <div className="flex justify-center py-4">
                    <span className="loading loading-spinner loading-sm text-primary" />
                  </div>
                )}

                {!addLoading && addError && (
                  <p className="text-xs text-error text-center">{addError}</p>
                )}

                {!addLoading && !addError && addRecipients.length === 0 && (
                  <p className="text-xs text-base-content/40 text-center py-2">Sin resultados.</p>
                )}

                {!addLoading && !addError && addRecipients.length > 0 && (
                  <div className="space-y-0.5 max-h-40 overflow-y-auto pr-0.5">
                    {addRecipients.map((r) => {
                      const typeCfg = TYPE_CONFIG[r.person_type];
                      const alreadyIn = existingPersonIds.has(String(r.person_id));
                      const isSelected = addSelected?.person_id === r.person_id;
                      return (
                        <button
                          key={r.person_id}
                          disabled={alreadyIn}
                          className={`w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all text-sm ${
                            alreadyIn
                              ? "opacity-40 cursor-not-allowed"
                              : isSelected
                              ? "bg-primary/8 ring-2 ring-primary/25"
                              : "hover:bg-base-200"
                          }`}
                          onClick={() => !alreadyIn && setAddSelected(isSelected ? null : r)}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                            typeCfg?.avatar ?? "bg-base-300 text-base-content/50"
                          }`}>
                            <span className={`iconify ${typeCfg?.icon ?? "lucide--user"} size-3.5`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate leading-snug">
                              {r.display_name || [r.given_name, r.paternal_name].filter(Boolean).join(" ") || r.person_internal_id || String(r.person_id)}
                            </p>
                            {r.person_internal_id && (
                              <p className="text-xs text-base-content/40 font-mono">{r.person_internal_id}</p>
                            )}
                          </div>
                          {alreadyIn ? (
                            <span className="text-xs text-base-content/40 shrink-0">Ya agregado</span>
                          ) : isSelected ? (
                            <span className="iconify lucide--check-circle size-4 text-primary shrink-0" />
                          ) : (
                            <span className={`badge badge-xs shrink-0 ${typeCfg?.badge ?? "badge-ghost"}`}>
                              {typeCfg?.label ?? r.person_type}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                {!addLoading && addTotal > PAGE_LIMIT && (
                  <div className="flex items-center justify-between pt-1 border-t border-base-200">
                    <span className="text-xs text-base-content/40">
                      {addSkip + 1}–{Math.min(addSkip + PAGE_LIMIT, addTotal)} de {addTotal}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setAddSkip(addSkip - PAGE_LIMIT)} disabled={!hasPrev}>
                        <span className="iconify lucide--chevron-left size-3.5" />
                      </button>
                      <span className="text-xs font-medium px-1">{currentPage}/{totalPages}</span>
                      <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setAddSkip(addSkip + PAGE_LIMIT)} disabled={!hasNext}>
                        <span className="iconify lucide--chevron-right size-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Save error */}
                {addSaveError && (
                  <div className="alert alert-error py-2">
                    <span className="iconify lucide--alert-circle size-4" />
                    <span className="text-xs">{addSaveError}</span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex justify-end gap-2 pt-1 border-t border-base-200">
                  <button className="btn btn-ghost btn-sm" onClick={handleCloseAddPanel} disabled={addSaving}>
                    Cancelar
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={!addSelected || addSaving}
                    onClick={handleAddParticipant}
                  >
                    {addSaving
                      ? <><span className="loading loading-spinner loading-xs" /> Agregando…</>
                      : <><span className="iconify lucide--user-plus size-4" /> Agregar</>
                    }
                  </button>
                </div>
              </div>
            )}
          </div>

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

                  {/* Date · Time · Duration — single row */}
                  <div className="grid items-center gap-2" style={{ gridTemplateColumns: "minmax(8rem, 1fr) auto auto" }}>
                    <div className="relative">
                      <span className="iconify lucide--calendar size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/35 pointer-events-none" />
                      <input
                        type="date"
                        className="input input-bordered input-sm w-full pl-8"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={todayISO()}
                      />
                    </div>
                    <TimePicker
                      value={startTime}
                      minTime={startDate === todayISO() ? nowTimeHHMM() : undefined}
                      onChange={setStartTime}
                    />
                    <select
                      className="select select-bordered select-sm"
                      value={scheduleDuration}
                      onChange={(e) => setScheduleDuration(Number(e.target.value))}
                    >
                      <option value={15}>15 min</option>
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                    </select>
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
                      className="textarea textarea-bordered focus:border-primary focus:outline-none resize-none text-sm w-full max-w-full box-border"
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
              disabled={saving || !startDate || !startTime}
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
