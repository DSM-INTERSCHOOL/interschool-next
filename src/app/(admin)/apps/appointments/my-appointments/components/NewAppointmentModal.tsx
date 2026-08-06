"use client";

import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSchoolStore } from "@/store/useSchoolStore";
import { getOrgConfig } from "@/lib/orgConfig";
import { getApiErrorMessage } from "@/lib/apiError";
import { TimePicker } from "@/components/TimePicker";
import { getAppointmentRecipients } from "@/services/auth.service";
import { createAppointment, getPersonSlots } from "@/services/appointment.service";
import { IAppointmentRecipient, IAvailableSlot, IAvailableSlotDay } from "@/interfaces/IAppointment";
import { SchedulingPolicy } from "@/interfaces/ISchool";

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_LIMIT = 20;

const STEP_LABELS = ["Detalles", "Destinatario", "Horario"];

const TYPE_CONFIG: Record<string, {
  label: string;
  icon: string;
  /** Classes applied to the card when it is the active filter */
  activeCard: string;
  /** Classes for the avatar circle in the recipient list */
  avatar: string;
  /** Badge classes for the type chip */
  badge: string;
}> = {
  USER:     { label: "Usuario",   icon: "lucide--user",           activeCard: "border-accent   bg-accent/10   text-accent",     avatar: "bg-accent/15   text-accent",     badge: "badge-accent"    },
  STUDENT:  { label: "Alumno",    icon: "lucide--graduation-cap", activeCard: "border-primary  bg-primary/10  text-primary",    avatar: "bg-primary/15  text-primary",    badge: "badge-primary"   },
  TEACHER:  { label: "Profesor",   icon: "lucide--user-check",     activeCard: "border-secondary bg-secondary/10 text-secondary", avatar: "bg-secondary/15 text-secondary", badge: "badge-secondary" },
  RELATIVE: { label: "Familiar",  icon: "lucide--users-round",    activeCard: "border-success  bg-success/10  text-success",    avatar: "bg-success/15  text-success",    badge: "badge-success"   },
  ACADEMIC: { label: "Académico", icon: "lucide--book-open",      activeCard: "border-warning  bg-warning/10  text-warning",    avatar: "bg-warning/15  text-warning",    badge: "badge-warning"   },
};

const DURATION_OPTIONS = [
  { value: 15,  label: "15 min" },
  { value: 30,  label: "30 min" },
  { value: 45,  label: "45 min" },
  { value: 60,  label: "1 hora" },
  { value: 90,  label: "1 h 30 min" },
  { value: 120, label: "2 horas" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const addDays = (dateStr: string, n: number): string => {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowTimeHHMM = () => {
  const n = new Date();
  return `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
};

const upcomingSunday = (dateStr: string): string => {
  const d = new Date(dateStr + "T12:00:00Z");
  const daysUntilSunday = d.getUTCDay() === 0 ? 0 : 7 - d.getUTCDay();
  return addDays(dateStr, daysUntilSunday);
};

const fmtSlotTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true });

const fmtDateLabel = (dateStr: string) =>
  new Date(dateStr + "T12:00:00Z").toLocaleDateString("es-MX", {
    weekday: "short", day: "numeric", month: "short",
  });

const fmtWeekRange = (start: string, end: string) => {
  const s = new Date(start + "T12:00:00Z");
  const e = new Date(end + "T12:00:00Z");
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${s.toLocaleDateString("es-MX", opts)} – ${e.toLocaleDateString("es-MX", { ...opts, year: "numeric" })}`;
};

const recipientName = (r: IAppointmentRecipient) =>
  r.display_name ||
  [r.given_name, r.paternal_name].filter(Boolean).join(" ") ||
  r.person_internal_id ||
  String(r.person_id);

const recipientPosition = (r: IAppointmentRecipient) =>
  r.job_position?.trim() || TYPE_CONFIG[r.person_type]?.label || r.person_type;

// ── Types ─────────────────────────────────────────────────────────────────────

type TimeMode = "open" | "slot" | "manual" | "propose";

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Thin section label used to group form fields visually. */
const SectionLabel = ({ icon, label }: { icon: string; label: string }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className={`iconify ${icon} size-4 text-base-content/40`} />
    <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">{label}</span>
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────

export const NewAppointmentModal = ({ onClose, onSuccess }: Props) => {
  const { personId, personType } = useAuth();
  const school = useSchoolStore((s) => s.school);

  // Navigation
  const [step, setStep] = useState(1);

  // Proposed slot builder — active when timeMode === "propose"
  const [proposedSlots, setProposedSlots] = useState<{ id: number; date: string; startTime: string; duration: number }[]>([]);
  const nextSlotId = useRef(0);

  // Step 1 – Details
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [virtualLink, setVirtualLink] = useState("");

  // Step 2 – Recipient
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [skip, setSkip] = useState(0);
  const [recipients, setRecipients] = useState<IAppointmentRecipient[]>([]);
  const [total, setTotal] = useState(0);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [recipientsError, setRecipientsError] = useState<string | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<IAppointmentRecipient | null>(null);
  const prevTypeRef = useRef<string | null | undefined>(undefined);
  const prevSkipRef = useRef(0);

  // Step 3 – Time
  const [timeMode, setTimeMode] = useState<TimeMode>("open");
  const [date, setDate] = useState(todayISO);
  const [startTime, setStartTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [slotWeekStart, setSlotWeekStart] = useState(todayISO);
  const [slotDays, setSlotDays] = useState<IAvailableSlotDay[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<IAvailableSlot | null>(null);

  // Submit
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Derived ─────────────────────────────────────────────────────────────────

  const allowedTypes: string[] = (() => {
    if (!personType || !school?.inoty_config?.inoty_appointments_config) return [];
    const cfg = school.inoty_config.inoty_appointments_config[personType];
    if (!cfg) return [];
    return Object.entries(cfg)
      .filter(([, p]) => p !== null && p.allowed_target_groups !== "NONE")
      .map(([t]) => t);
  })();

  const noConfig = !school?.inoty_config?.inoty_appointments_config;

  const schedulingPolicy: SchedulingPolicy | null = (() => {
    if (!personType || !selectedRecipient || !school?.inoty_config?.inoty_appointments_config) return null;
    const cfg = school.inoty_config.inoty_appointments_config[personType];
    return cfg?.[selectedRecipient.person_type]?.schedulingPolicy ?? null;
  })();

  // When true and policy is RECIPIENT_SLOT_REQUIRED, the manual scheduling mode
  // is also offered (the user can bypass slots and enter a custom date/time).
  const customSlotEnabled: boolean = (() => {
    if (!personType || !selectedRecipient || !school?.inoty_config?.inoty_appointments_config) return false;
    const cfg = school.inoty_config.inoty_appointments_config[personType];
    return cfg?.[selectedRecipient.person_type]?.custom_slot_enabled ?? false;
  })();

  const hasPrev = skip > 0;
  const hasNext = skip + PAGE_LIMIT < total;
  const totalPages = Math.ceil(total / PAGE_LIMIT);
  const currentPage = Math.floor(skip / PAGE_LIMIT) + 1;

  const weekEnd = upcomingSunday(slotWeekStart);
  const canGoPrevWeek = slotWeekStart > todayISO();
  const activeDays = slotDays.filter((d) => d.slots.length > 0);

  // ── Slot fetch ───────────────────────────────────────────────────────────────

  const fetchSlots = useCallback(async (recipientPersonId: string, weekStart: string) => {
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;
    setSlotsLoading(true);
    setSlotsError(null);
    setSlotDays([]);
    try {
      const data = await getPersonSlots({
        schoolId, personId: recipientPersonId,
        fromDate: weekStart, toDate: upcomingSunday(weekStart),
      });
      setSlotDays(data.days ?? []);
    } catch {
      setSlotsError("Sin disponibilidad para este período.");
      setSlotDays([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (step !== 3 || timeMode !== "slot" || !selectedRecipient) return;
    fetchSlots(String(selectedRecipient.person_id), slotWeekStart);
  }, [step, timeMode, slotWeekStart, selectedRecipient, fetchSlots]);

  // ── Recipient fetch ──────────────────────────────────────────────────────────

  const fetchRecipients = useCallback(async (type: string | null, query: string, currentSkip: number) => {
    if (!personId || !personType) return;
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;
    setRecipientsLoading(true);
    setRecipientsError(null);
    try {
      const result = await getAppointmentRecipients({
        schoolId, personId, personType,
        searchTerm: query, targetPersonType: type,
        skip: currentSkip, limit: PAGE_LIMIT,
      });
      setRecipients(result.items);
      setTotal(result.total);
    } catch {
      setRecipientsError("Error al cargar destinatarios");
      setRecipients([]);
      setTotal(0);
    } finally {
      setRecipientsLoading(false);
    }
  }, [personId, personType]);

  useEffect(() => {
    if (step !== 2 || allowedTypes.length === 0) return;
    const typeChanged = prevTypeRef.current !== selectedType;
    const skipChanged = prevSkipRef.current !== skip;
    prevTypeRef.current = selectedType;
    prevSkipRef.current = skip;
    const delay = typeChanged || skipChanged ? 0 : 400;
    const timer = setTimeout(() => fetchRecipients(selectedType, searchQuery, skip), delay);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedType, searchQuery, skip, fetchRecipients]);

  // ── Navigation ───────────────────────────────────────────────────────────────

  const handleTypeClick = (type: string | null) => {
    setSelectedType(type); setSkip(0); setSelectedRecipient(null);
  };
  const handleSearchChange = (value: string) => {
    setSearchQuery(value.toUpperCase()); setSkip(0); setSelectedRecipient(null);
  };

  const goToStep3 = () => {
    const policy = (() => {
      if (!personType || !selectedRecipient || !school?.inoty_config?.inoty_appointments_config) return null;
      const cfg = school.inoty_config.inoty_appointments_config[personType];
      return cfg?.[selectedRecipient.person_type]?.schedulingPolicy ?? null;
    })();
    // Default to "slot" when the policy requires it; otherwise start on "open".
    // Even when custom_slot_enabled unlocks manual mode for RECIPIENT_SLOT_REQUIRED,
    // slot is still the recommended default.
    setTimeMode(policy === "RECIPIENT_SLOT_REQUIRED" ? "slot" : "open");
    setSelectedSlot(null);
    setSlotDays([]);
    setSlotsError(null);
    setSlotWeekStart(todayISO());
    setProposedSlots([]);
    setStep(3);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const canSubmit = (() => {
    if (submitLoading) return false;
    if (timeMode === "slot") return !!selectedSlot && !slotsError;
    if (timeMode === "manual") return !!date && !!startTime;
    if (timeMode === "propose") return proposedSlots.length > 0;
    return !!date; // "open"
  })();

  const handleSubmit = async () => {
    if (!personId || !selectedRecipient || !canSubmit) return;
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      const base = {
        host_person_id: String(personId),
        title: title.trim() || null,
        description: description.trim() || null,
        location: location.trim() || null,
        virtual_link: virtualLink.trim() || null,
        notes: null,
        participant_ids: [String(selectedRecipient.person_id)],
        ...(timeMode === "propose" && proposedSlots.length > 0 && {
          proposed_slots: proposedSlots.map((s) => {
            const start = new Date(`${s.date}T${s.startTime}:00`);
            return {
              start_datetime: start.toISOString(),
              end_datetime: new Date(start.getTime() + s.duration * 60_000).toISOString(),
            };
          }),
        }),
      };

      if (timeMode === "open") {
        await createAppointment({
          schoolId,
          dto: {
            ...base,
            without_time: true,
            scheduled_start: new Date(`${date}T00:00:00`).toISOString(),
            scheduled_end: new Date(`${date}T00:00:00`).toISOString(),
            duration_minutes: 0,
          },
        });
      } else if (timeMode === "propose") {
        await createAppointment({
          schoolId,
          dto: {
            ...base,
            without_time: true,
            scheduled_start: null,
            scheduled_end: null,
            duration_minutes: 0,
          },
        });
      } else {
        let scheduledStart: string, scheduledEnd: string, duration: number;
        if (timeMode === "slot" && selectedSlot) {
          scheduledStart = selectedSlot.start;
          scheduledEnd = selectedSlot.end;
          duration = Math.round((new Date(selectedSlot.end).getTime() - new Date(selectedSlot.start).getTime()) / 60_000);
        } else {
          const start = new Date(`${date}T${startTime}:00`);
          scheduledStart = start.toISOString();
          const end = new Date(start.getTime() + durationMinutes * 60_000);
          scheduledEnd = end.toISOString();
          duration = durationMinutes;
        }
        await createAppointment({
          schoolId,
          dto: {
            ...base,
            without_time: false,
            scheduled_start: scheduledStart,
            scheduled_end: scheduledEnd,
            duration_minutes: duration,
          },
        });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, "No se pudo crear la cita. Intenta de nuevo."));
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  const isSlotMode = timeMode === "slot";
  const showSlotPicker = step === 3 && isSlotMode;
  const showModePicker = step === 3;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg flex flex-col" style={{ maxHeight: "92vh" }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="iconify lucide--calendar-plus size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-xl leading-tight">Nueva cita</h3>
              <p className="text-xs text-base-content/40 mt-0.5">{STEP_LABELS[step - 1]}</p>
            </div>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose} disabled={submitLoading}>
            <span className="iconify lucide--x size-5" />
          </button>
        </div>

        {/* ── Step indicator ───────────────────────────────────────────────── */}
        <div className="flex items-center mb-6 shrink-0">
          {[1, 2, 3].map((s) => (
            <Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s ? "bg-primary text-primary-content shadow-md shadow-primary/30"
                  : step > s ? "bg-primary/20 text-primary"
                  : "bg-base-200 text-base-content/30"
                }`}>
                  {step > s ? <span className="iconify lucide--check size-3.5" /> : s}
                </div>
                <span className={`text-xs font-medium transition-colors ${
                  step === s ? "text-base-content" : "text-base-content/30"
                }`}>
                  {STEP_LABELS[s - 1]}
                </span>
              </div>
              {s < 3 && (
                <div className={`flex-1 h-0.5 mx-2 transition-colors ${step > s ? "bg-primary/40" : "bg-base-200"}`} />
              )}
            </Fragment>
          ))}
        </div>

        {/* ══ STEP 1: Details ══════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="flex flex-col gap-5 flex-1 overflow-y-auto pr-0.5">

            {/* Basic info */}
            <div className="rounded-xl border border-base-200 p-4 space-y-4 bg-base-50">
              <SectionLabel icon="lucide--file-text" label="Información básica" />

              <div className="form-control">
                <label className="label pb-1.5">
                  <span className="label-text font-medium">Título</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered focus:input-primary w-full"
                  placeholder="Ej. Reunión de seguimiento"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="form-control">
                <label className="label pb-1.5">
                  <span className="label-text font-medium">Descripción</span>
                  <span className="label-text-alt text-base-content/40">Opcional</span>
                </label>
                <textarea
                  className="textarea textarea-bordered focus:textarea-primary resize-none w-full"
                  placeholder="Ej. Revisión de avances del trimestre"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            {/* Location */}
            <div className="rounded-xl border border-base-200 p-4 space-y-4 bg-base-50">
              <SectionLabel icon="lucide--map-pin" label="Ubicación" />

              <div className="form-control">
                <label className="label pb-1.5">
                  <span className="label-text font-medium">Lugar físico</span>
                  <span className="label-text-alt text-base-content/40">Opcional</span>
                </label>
                <div className="relative">
                  <span className="iconify lucide--map-pin size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/35 pointer-events-none" />
                  <input
                    type="text"
                    className="input input-bordered focus:input-primary w-full pl-9"
                    placeholder="Ej. Sala de juntas B"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label pb-1.5">
                  <span className="label-text font-medium">Liga virtual</span>
                  <span className="label-text-alt text-base-content/40">Opcional</span>
                </label>
                <div className="relative">
                  <span className="iconify lucide--video size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/35 pointer-events-none" />
                  <input
                    type="url"
                    className="input input-bordered focus:input-primary w-full pl-9"
                    placeholder="https://meet.google.com/…"
                    value={virtualLink}
                    onChange={(e) => setVirtualLink(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 2: Recipient ════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="flex flex-col flex-1 min-h-0">

            {/* ── Static header: description + type filter + search ── */}
            <div className="shrink-0">
            <p className="text-sm text-base-content/55 mb-4">
              ¿Con qué persona deseas agendar la cita?
            </p>

            {/* Type cards */}
            <div className="mb-4">
              {noConfig ? (
                <div className="alert alert-warning">
                  <span className="iconify lucide--alert-triangle size-5" />
                  <span className="text-sm">Configuración de escuela no disponible. Cierra sesión y vuelve a entrar.</span>
                </div>
              ) : allowedTypes.length === 0 ? (
                <div className="alert alert-info">
                  <span className="iconify lucide--info size-5" />
                  <span className="text-sm">No tienes permisos para agendar reuniones.</span>
                </div>
              ) : (
                <>
                  <div className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-2.5">
                    Tipo de persona
                  </div>
                  <div className="flex gap-2">
                    {/* "All" card */}
                    <button
                      onClick={() => handleTypeClick(null)}
                      className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg border-2 transition-all cursor-pointer min-w-0 ${
                        selectedType === null
                          ? "border-base-content/50 bg-base-content/8 text-base-content"
                          : "border-base-200 text-base-content/40 hover:border-base-300 hover:text-base-content/60"
                      }`}
                    >
                      <span className="iconify lucide--search size-4" />
                      <span className="text-[11px] font-semibold">Todos</span>
                    </button>

                    {allowedTypes.map((type) => {
                      const cfg = TYPE_CONFIG[type];
                      const isActive = selectedType === type;
                      return (
                        <button
                          key={type}
                          onClick={() => handleTypeClick(type)}
                          className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg border-2 transition-all cursor-pointer min-w-0 ${
                            isActive
                              ? cfg?.activeCard ?? "border-primary bg-primary/10 text-primary"
                              : "border-base-200 text-base-content/40 hover:border-base-300 hover:text-base-content/60"
                          }`}
                        >
                          <span className={`iconify ${cfg?.icon ?? "lucide--user"} size-4`} />
                          <span className="text-[11px] font-semibold truncate w-full text-center">{cfg?.label ?? type}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Search */}
            {allowedTypes.length > 0 && (
              <div className="relative mb-3">
                <span className="iconify lucide--search size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/35 pointer-events-none" />
                <input
                  type="text"
                  className="input input-bordered focus:input-primary w-full pl-9 pr-9 uppercase"
                  placeholder={
                    selectedType
                      ? `Buscar ${TYPE_CONFIG[selectedType]?.label ?? selectedType}…`
                      : "Buscar por nombre o ID…"
                  }
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    className="btn btn-ghost btn-xs btn-circle absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => handleSearchChange("")}
                  >
                    <span className="iconify lucide--x size-3.5" />
                  </button>
                )}
              </div>
            )}
            </div>{/* end static header */}

            {/* Recipient list — fixed size with vertical scroll (shrinks if space is tight) */}
            {allowedTypes.length > 0 && (
              <div className="overflow-y-auto min-h-0 flex flex-col" style={{ height: "360px" }}>
                {recipientsLoading && (
                  <div className="flex justify-center py-8">
                    <span className="loading loading-spinner loading-md text-primary" />
                  </div>
                )}

                {!recipientsLoading && recipientsError && (
                  <div className="alert alert-error">
                    <span className="iconify lucide--alert-circle size-4" />
                    <span className="text-sm">{recipientsError}</span>
                  </div>
                )}

                {!recipientsLoading && !recipientsError && recipients.length === 0 && (
                  <div className="text-center py-8">
                    <span className="iconify lucide--users size-10 text-base-content/15 block mx-auto mb-2" />
                    <p className="text-sm text-base-content/40">Sin resultados.</p>
                  </div>
                )}

                {!recipientsLoading && !recipientsError && recipients.length > 0 && (
                  <>
                    <div className="space-y-1 pr-0.5">
                      {recipients.map((r) => {
                        const typeCfg = TYPE_CONFIG[r.person_type];
                        const isSelected = selectedRecipient?.person_id === r.person_id;
                        return (
                          <button
                            key={r.person_id}
                            className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all ${
                              isSelected
                                ? "bg-primary/8 ring-2 ring-primary/25"
                                : "hover:bg-base-200"
                            }`}
                            onClick={() =>
                              setSelectedRecipient(isSelected ? null : r)
                            }
                          >
                            {/* Colored avatar */}
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                              typeCfg?.avatar ?? "bg-base-300 text-base-content/50"
                            }`}>
                              <span className={`iconify ${typeCfg?.icon ?? "lucide--user"} size-4`} />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate leading-snug">
                                {recipientName(r)}
                              </p>
                              <p className="text-xs text-base-content/45 truncate mt-0.5">
                                {r.person_internal_id && (
                                  <span className="font-mono mr-2">{r.person_internal_id}</span>
                                )}
                                <span>{recipientPosition(r)}</span>
                              </p>
                            </div>

                            {/* Type badge */}
                            <span className={`badge badge-xs shrink-0 ${typeCfg?.badge ?? "badge-ghost"}`}>
                              {typeCfg?.label ?? r.person_type}
                            </span>

                            {/* Selected indicator */}
                            {isSelected && (
                              <span className="iconify lucide--check-circle size-4 text-primary shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-base-200 sticky bottom-0 bg-base-100">
                      <span className="text-xs text-base-content/40">
                        {skip + 1}–{Math.min(skip + PAGE_LIMIT, total)} de {total}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          className="btn btn-ghost btn-xs btn-circle"
                          onClick={() => setSkip(skip - PAGE_LIMIT)}
                          disabled={!hasPrev}
                        >
                          <span className="iconify lucide--chevron-left size-4" />
                        </button>
                        <span className="text-xs font-medium px-1">
                          {currentPage} / {totalPages}
                        </span>
                        <button
                          className="btn btn-ghost btn-xs btn-circle"
                          onClick={() => setSkip(skip + PAGE_LIMIT)}
                          disabled={!hasNext}
                        >
                          <span className="iconify lucide--chevron-right size-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ STEP 3: Time ══════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="flex flex-col flex-1 overflow-hidden min-h-0">

            {/* Recipient summary */}
            {selectedRecipient && (() => {
              const typeCfg = TYPE_CONFIG[selectedRecipient.person_type];
              return (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-base-200 bg-base-50 mb-4 shrink-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    typeCfg?.avatar ?? "bg-base-300 text-base-content/50"
                  }`}>
                    <span className={`iconify ${typeCfg?.icon ?? "lucide--user"} size-4`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{recipientName(selectedRecipient)}</p>
                    <p className="text-xs text-base-content/40 mt-0.5">
                      {typeCfg?.label ?? selectedRecipient.person_type}
                    </p>
                  </div>
                  <button
                    className="btn btn-xs btn-ghost text-base-content/40"
                    onClick={() => setStep(2)}
                  >
                    Cambiar
                  </button>
                </div>
              );
            })()}

            {/* Mode selector */}
            {showModePicker && (() => {
              // Count visible buttons to pick the right grid column count
              const nButtons = [
                customSlotEnabled,                                                                                               // "Propose" — only when flag is set
                schedulingPolicy !== "RECIPIENT_SLOT_REQUIRED",                                                                  // "Open"
                schedulingPolicy === "RECIPIENT_SLOT_REQUIRED" || schedulingPolicy === "RECIPIENT_SLOT_OPTIONAL",                // "Slot"
                schedulingPolicy === "FREE_SCHEDULING" || schedulingPolicy === "NO_SLOT_REQUIRED" || schedulingPolicy === null,  // "Manual"
              ].filter(Boolean).length;
              return (
                <div className="mb-4 shrink-0">
                  <div className="text-xs font-semibold text-base-content/40 uppercase tracking-wider mb-2.5">
                    Tipo de horario
                  </div>
                  <div className={`grid gap-2 ${nButtons >= 4 ? "grid-cols-4" : "grid-cols-3"}`}>

                    {/* "Open" mode — hidden when slot is required */}
                    {schedulingPolicy !== "RECIPIENT_SLOT_REQUIRED" && (
                      <button
                        className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all ${
                          timeMode === "open"
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-base-200 text-base-content/40 hover:border-base-300 hover:text-base-content/60"
                        }`}
                        onClick={() => { setTimeMode("open"); setSelectedSlot(null); }}
                      >
                        <span className="iconify lucide--calendar-off size-5" />
                        <span className="text-xs font-semibold text-center leading-tight">Horario abierto</span>
                      </button>
                    )}

                    {/* "Slot" mode — shown when policy requires or allows slots */}
                    {(schedulingPolicy === "RECIPIENT_SLOT_REQUIRED" || schedulingPolicy === "RECIPIENT_SLOT_OPTIONAL") && (
                      <button
                        className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all ${
                          timeMode === "slot"
                            ? "border-secondary bg-secondary/10 text-secondary"
                            : "border-base-200 text-base-content/40 hover:border-base-300 hover:text-base-content/60"
                        }`}
                        onClick={() => setTimeMode("slot")}
                      >
                        <span className="iconify lucide--clock size-5" />
                        <span className="text-xs font-semibold text-center leading-tight">Slots disponibles</span>
                      </button>
                    )}

                    {/* "Manual" mode — shown for free-scheduling policies */}
                    {(schedulingPolicy === "FREE_SCHEDULING" || schedulingPolicy === "NO_SLOT_REQUIRED" || schedulingPolicy === null) && (
                      <button
                        className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all ${
                          timeMode === "manual"
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-base-200 text-base-content/40 hover:border-base-300 hover:text-base-content/60"
                        }`}
                        onClick={() => setTimeMode("manual")}
                      >
                        <span className="iconify lucide--calendar-clock size-5" />
                        <span className="text-xs font-semibold text-center leading-tight">Horario específico</span>
                      </button>
                    )}

                    {/* "Propose" mode — last, only when custom_slot_enabled */}
                    {customSlotEnabled && (
                      <button
                        className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all ${
                          timeMode === "propose"
                            ? "border-success bg-success/10 text-success"
                            : "border-base-200 text-base-content/40 hover:border-base-300 hover:text-base-content/60"
                        }`}
                        onClick={() => { setTimeMode("propose"); setSelectedSlot(null); setProposedSlots([]); }}
                      >
                        <span className="iconify lucide--calendar-range size-5" />
                        <span className="text-xs font-semibold text-center leading-tight">Proponer slots</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Slot picker */}
            {showSlotPicker && (
              <div className="flex flex-col flex-1 overflow-hidden min-h-0">
                {/* Week navigator */}
                <div className="flex items-center justify-between mb-3 shrink-0 px-1">
                  <button
                    className="btn btn-ghost btn-sm btn-circle"
                    disabled={!canGoPrevWeek}
                    onClick={() => {
                      const prev = addDays(slotWeekStart, -7);
                      setSlotWeekStart(prev < todayISO() ? todayISO() : prev);
                      setSelectedSlot(null);
                    }}
                  >
                    <span className="iconify lucide--chevron-left size-4" />
                  </button>
                  <span className="text-sm font-medium text-base-content/70">
                    {fmtWeekRange(slotWeekStart, weekEnd)}
                  </span>
                  <button
                    className="btn btn-ghost btn-sm btn-circle"
                    onClick={() => { setSlotWeekStart(addDays(weekEnd, 1)); setSelectedSlot(null); }}
                  >
                    <span className="iconify lucide--chevron-right size-4" />
                  </button>
                </div>

                {slotsLoading && (
                  <div className="flex justify-center py-8">
                    <span className="loading loading-spinner loading-md text-primary" />
                  </div>
                )}

                {!slotsLoading && slotsError && (
                  <div className="alert alert-error">
                    <span className="iconify lucide--alert-circle size-5" />
                    <div>
                      <p className="text-sm font-medium">{slotsError}</p>
                      {schedulingPolicy === "RECIPIENT_SLOT_REQUIRED" && (
                        <p className="text-xs opacity-70 mt-0.5">No es posible completar la cita sin un horario disponible.</p>
                      )}
                    </div>
                  </div>
                )}

                {!slotsLoading && !slotsError && activeDays.length === 0 && (
                  <div className="text-center py-8">
                    <span className="iconify lucide--calendar-x size-10 text-base-content/20 block mx-auto mb-2" />
                    <p className="text-sm text-base-content/50">Sin horarios disponibles esta semana.</p>
                    <p className="text-xs text-base-content/30 mt-1">Navega a otra semana.</p>
                  </div>
                )}

                {!slotsLoading && !slotsError && activeDays.length > 0 && (
                  <div className="overflow-y-auto flex-1 space-y-3 pr-0.5">
                    {activeDays.map((day) => (
                      <div key={day.date}>
                        <p className="text-xs font-semibold text-base-content/40 uppercase tracking-wide mb-1.5 capitalize">
                          {fmtDateLabel(day.date)}
                        </p>
                        <div className="grid grid-cols-4 gap-1.5">
                          {day.slots.map((slot, i) => (
                            <button
                              key={i}
                              className={`btn btn-sm rounded-lg w-full whitespace-nowrap ${
                                selectedSlot?.start === slot.start
                                  ? "btn-primary"
                                  : "btn-outline"
                              }`}
                              onClick={() =>
                                setSelectedSlot(selectedSlot?.start === slot.start ? null : slot)
                              }
                            >
                              {fmtSlotTime(slot.start)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Open mode – date only */}
            {step === 3 && timeMode === "open" && (
              <div className="rounded-xl border border-base-200 p-4 shrink-0">
                <SectionLabel icon="lucide--calendar" label="Fecha" />
                <div className="form-control">
                  <label className="label pb-1.5">
                    <span className="label-text font-medium">Fecha de la cita</span>
                  </label>
                  <div className="relative">
                    <span className="iconify lucide--calendar size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/35 pointer-events-none" />
                    <input
                      type="date"
                      className="input input-bordered focus:input-primary w-full pl-9"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={todayISO()}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Manual mode – date + time + duration (single row) */}
            {step === 3 && timeMode === "manual" && (
              <div className="rounded-xl border border-base-200 p-4 shrink-0">
                <SectionLabel icon="lucide--calendar-clock" label="Fecha y hora" />
                <div className="grid items-center gap-2 mt-3" style={{ gridTemplateColumns: "minmax(8rem, 1fr) auto auto" }}>
                  <div className="relative">
                    <span className="iconify lucide--calendar size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/35 pointer-events-none" />
                    <input
                      type="date"
                      className="input input-bordered input-sm w-full pl-8"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={todayISO()}
                    />
                  </div>
                  <TimePicker
                    value={startTime}
                    minTime={date === todayISO() ? nowTimeHHMM() : undefined}
                    onChange={setStartTime}
                  />
                  <select
                    className="select select-bordered select-sm"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  >
                    {DURATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* ── Propose mode – slot builder ────────────────────────────── */}
            {step === 3 && timeMode === "propose" && (
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <p className="text-xs text-base-content/50 mb-3 shrink-0">
                  Define horarios opcionales para que el destinatario elija uno.
                </p>

                {/* Slot rows */}
                <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-0.5">
                  {proposedSlots.length === 0 && (
                    <div className="text-center py-6">
                      <span className="iconify lucide--calendar-range size-10 text-base-content/15 block mx-auto mb-2" />
                      <p className="text-sm text-base-content/40">Agrega al menos un horario propuesto.</p>
                    </div>
                  )}

                  {proposedSlots.map((slot) => (
                    <div key={slot.id} className="grid items-center gap-2" style={{ gridTemplateColumns: "minmax(8rem, 1fr) auto auto auto" }}>
                      {/* Date */}
                      <div className="relative">
                        <span className="iconify lucide--calendar size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/35 pointer-events-none" />
                        <input
                          type="date"
                          className="input input-bordered input-sm w-full pl-8"
                          value={slot.date}
                          min={todayISO()}
                          onChange={(e) =>
                            setProposedSlots((prev) =>
                              prev.map((s) => s.id === slot.id ? { ...s, date: e.target.value } : s)
                            )
                          }
                        />
                      </div>

                      {/* Start time */}
                      <TimePicker
                        value={slot.startTime}
                        minTime={slot.date === todayISO() ? nowTimeHHMM() : undefined}
                        onChange={(v) =>
                          setProposedSlots((prev) =>
                            prev.map((s) => s.id === slot.id ? { ...s, startTime: v } : s)
                          )
                        }
                      />

                      {/* Duration */}
                      <select
                        className="select select-bordered select-sm"
                        value={slot.duration}
                        onChange={(e) =>
                          setProposedSlots((prev) =>
                            prev.map((s) => s.id === slot.id ? { ...s, duration: Number(e.target.value) } : s)
                          )
                        }
                      >
                        <option value={15}>15 min</option>
                        <option value={30}>30 min</option>
                        <option value={45}>45 min</option>
                        <option value={60}>60 min</option>
                      </select>

                      {/* Delete */}
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs btn-circle text-base-content/30 hover:text-error"
                        onClick={() => setProposedSlots((prev) => prev.filter((s) => s.id !== slot.id))}
                      >
                        <span className="iconify lucide--x size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add button — pinned at bottom */}
                <button
                  type="button"
                  className="btn btn-ghost btn-sm gap-1.5 shrink-0 mt-2 w-full border border-dashed border-success/40 text-success hover:bg-success/5"
                  onClick={() => {
                    const id = nextSlotId.current++;
                    setProposedSlots((prev) => [
                      ...prev,
                      { id, date: todayISO(), startTime: "09:00", duration: 30 },
                    ]);
                  }}
                >
                  <span className="iconify lucide--plus size-4" />
                  Agregar horario
                </button>
              </div>
            )}

            {submitError && (
              <div className="alert alert-error mt-3 shrink-0">
                <span className="iconify lucide--alert-circle size-4" />
                <span className="text-sm">{submitError}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="flex justify-between mt-5 shrink-0 pt-4 border-t border-base-200">
          <button
            className="btn btn-ghost"
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
            disabled={submitLoading}
          >
            {step === 1 ? (
              "Cancelar"
            ) : (
              <><span className="iconify lucide--arrow-left size-4" /> Anterior</>
            )}
          </button>

          {step < 3 ? (
            <button
              className="btn btn-primary"
              disabled={step === 1 ? !title.trim() : !selectedRecipient}
              onClick={step === 2 ? goToStep3 : () => setStep(step + 1)}
            >
              Siguiente
              <span className="iconify lucide--arrow-right size-4" />
            </button>
          ) : (
            <button
              className="btn btn-primary"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {submitLoading ? (
                <><span className="loading loading-spinner loading-sm" /> Creando…</>
              ) : (
                <><span className="iconify lucide--check size-4" /> Confirmar cita</>
              )}
            </button>
          )}
        </div>
      </div>
      <div className="modal-backdrop" onClick={!submitLoading ? onClose : undefined} />
    </div>
  );
};
