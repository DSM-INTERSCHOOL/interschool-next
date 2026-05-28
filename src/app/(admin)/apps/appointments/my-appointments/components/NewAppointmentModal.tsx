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

const TYPE_LABELS: Record<string, string> = {
  USER:     "Usuario",
  STUDENT:  "Alumno",
  TEACHER:  "Maestro",
  RELATIVE: "Familiar",
  ACADEMIC: "Académico",
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

// Returns the date of the Sunday of the week containing dateStr (Sunday = end of week).
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
  r.job_position?.trim() || TYPE_LABELS[r.person_type] || r.person_type;

// ── Types ─────────────────────────────────────────────────────────────────────

type TimeMode = "open" | "slot" | "manual";

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const NewAppointmentModal = ({ onClose, onSuccess }: Props) => {
  const { personId, personType } = useAuth();
  const school = useSchoolStore((s) => s.school);

  // Navigation
  const [step, setStep] = useState(1);

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
        schoolId,
        personId: recipientPersonId,
        fromDate: weekStart,
        toDate: upcomingSunday(weekStart),
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
    setSearchQuery(value); setSkip(0); setSelectedRecipient(null);
  };

  const goToStep3 = () => {
    const policy = (() => {
      if (!personType || !selectedRecipient || !school?.inoty_config?.inoty_appointments_config) return null;
      const cfg = school.inoty_config.inoty_appointments_config[personType];
      return cfg?.[selectedRecipient.person_type]?.schedulingPolicy ?? null;
    })();
    setTimeMode(policy === "RECIPIENT_SLOT_REQUIRED" ? "slot" : "open");
    setSelectedSlot(null);
    setSlotDays([]);
    setSlotsError(null);
    setSlotWeekStart(todayISO());
    setStep(3);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const canSubmit = (() => {
    if (submitLoading) return false;
    if (timeMode === "slot") return !!selectedSlot && !slotsError;
    if (timeMode === "manual") return !!date && !!startTime;
    return !!date; // open – date required
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
      };

      if (timeMode === "open") {
        await createAppointment({
          schoolId,
          dto: {
            ...base,
            without_time: true,
            scheduled_start: `${date}T00:00:00Z`,
            scheduled_end: `${date}T23:59:59Z`,
            duration_minutes: 1140,
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
  const showModePicker = step === 3 && schedulingPolicy !== "RECIPIENT_SLOT_REQUIRED";

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md flex flex-col" style={{ maxHeight: "90vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="iconify lucide--calendar-plus size-4 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-xl">Nueva cita</h3>
              <p className="text-xs text-base-content/50">{STEP_LABELS[step - 1]}</p>
            </div>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose} disabled={submitLoading}>
            <span className="iconify lucide--x size-5" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-5 shrink-0">
          {[1, 2, 3].map((s) => (
            <Fragment key={s}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === s ? "bg-primary text-primary-content"
                : step > s ? "bg-primary/20 text-primary"
                : "bg-base-300 text-base-content/40"
              }`}>
                {step > s ? <span className="iconify lucide--check size-3.5" /> : s}
              </div>
              {s < 3 && <div className={`h-0.5 w-10 transition-colors ${step > s ? "bg-primary/40" : "bg-base-300"}`} />}
            </Fragment>
          ))}
        </div>

        {/* ── Step 1: Details ───────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-sm font-medium">Título</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                placeholder="Ej. Reunión de seguimiento"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-sm font-medium">Descripción</span>
                <span className="label-text-alt text-base-content/40">Opcional</span>
              </label>
              <textarea
                className="textarea textarea-bordered resize-none"
                placeholder="Ej. Revisión de avances del trimestre"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-sm font-medium">Lugar</span>
                <span className="label-text-alt text-base-content/40">Opcional</span>
              </label>
              <div className="relative">
                <span className="iconify lucide--map-pin size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
                <input
                  type="text"
                  className="input input-bordered w-full pl-9"
                  placeholder="Ej. Sala de juntas B"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label pb-1">
                <span className="label-text text-sm font-medium">Liga virtual</span>
                <span className="label-text-alt text-base-content/40">Opcional</span>
              </label>
              <div className="relative">
                <span className="iconify lucide--video size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
                <input
                  type="url"
                  className="input input-bordered w-full pl-9"
                  placeholder="https://meet.google.com/…"
                  value={virtualLink}
                  onChange={(e) => setVirtualLink(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Recipient ──────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="flex flex-col flex-1 overflow-hidden min-h-0">
            <p className="text-sm text-base-content/60 mb-3 shrink-0">
              ¿Con qué persona deseas agendar la cita?
            </p>

            <div className="shrink-0">
              {noConfig ? (
                <div className="alert alert-warning">
                  <span className="iconify lucide--alert-triangle size-5" />
                  <span className="text-sm">Configuración de escuela no disponible. Cierra sesión y vuelve a entrar.</span>
                </div>
              ) : allowedTypes.length === 0 ? (
                <div className="alert alert-info">
                  <span className="iconify lucide--info size-5" />
                  <span className="text-sm">No tienes permisos para agendar citas.</span>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-2">
                  <button
                    className={`btn btn-sm flex-col h-auto py-2 gap-1 ${selectedType === null ? "btn-primary" : "btn-outline"}`}
                    onClick={() => handleTypeClick(null)}
                  >
                    <span className="iconify lucide--search size-4" />
                    <span className="text-xs">Cualquiera</span>
                  </button>
                  {allowedTypes.map((type) => (
                    <button
                      key={type}
                      className={`btn btn-sm flex-col h-auto py-2 gap-1 ${selectedType === type ? "btn-primary" : "btn-outline"}`}
                      onClick={() => handleTypeClick(type)}
                    >
                      <span className="iconify lucide--user size-4" />
                      <span className="text-xs">{TYPE_LABELS[type] ?? type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {allowedTypes.length > 0 && (
              <div className="relative mt-3 shrink-0">
                <span className="iconify lucide--search size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
                <input
                  type="text"
                  className="input input-bordered w-full pl-9 pr-9"
                  placeholder={selectedType ? `Buscar ${TYPE_LABELS[selectedType] ?? selectedType}…` : "Buscar por nombre o ID…"}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  autoFocus
                />
                {searchQuery && (
                  <button className="btn btn-ghost btn-xs btn-circle absolute right-2 top-1/2 -translate-y-1/2" onClick={() => handleSearchChange("")}>
                    <span className="iconify lucide--x size-3.5" />
                  </button>
                )}
              </div>
            )}

            {allowedTypes.length > 0 && (
              <div className="mt-3 flex-1 overflow-hidden flex flex-col min-h-0">
                {recipientsLoading && (
                  <div className="flex justify-center py-6">
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
                  <p className="text-center text-base-content/40 text-sm py-6">Sin resultados.</p>
                )}
                {!recipientsLoading && !recipientsError && recipients.length > 0 && (
                  <>
                    <div className="overflow-y-auto max-h-52 space-y-1 pr-1">
                      {recipients.map((r) => (
                        <button
                          key={r.person_id}
                          className={`w-full text-left flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                            selectedRecipient?.person_id === r.person_id
                              ? "bg-primary/10 outline outline-2 outline-primary/40"
                              : "hover:bg-base-200"
                          }`}
                          onClick={() => setSelectedRecipient(selectedRecipient?.person_id === r.person_id ? null : r)}
                        >
                          <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center shrink-0">
                            <span className="iconify lucide--user size-4 text-base-content/50" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{recipientName(r)}</p>
                            <p className="text-xs text-base-content/50 truncate">
                              {r.person_internal_id && <span className="mr-2">{r.person_internal_id}</span>}
                              <span>{recipientPosition(r)}</span>
                            </p>
                          </div>
                          <span className="badge badge-ghost badge-xs shrink-0">
                            {TYPE_LABELS[r.person_type] ?? r.person_type}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-base-200 shrink-0">
                      <span className="text-xs text-base-content/50">
                        {skip + 1}–{Math.min(skip + PAGE_LIMIT, total)} de {total}
                      </span>
                      <div className="flex items-center gap-1">
                        <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setSkip(skip - PAGE_LIMIT)} disabled={!hasPrev}>
                          <span className="iconify lucide--chevron-left size-4" />
                        </button>
                        <span className="text-xs font-medium px-1">{currentPage} / {totalPages}</span>
                        <button className="btn btn-ghost btn-xs btn-circle" onClick={() => setSkip(skip + PAGE_LIMIT)} disabled={!hasNext}>
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

        {/* ── Step 3: Time ──────────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="flex flex-col flex-1 overflow-hidden min-h-0">

            {/* Recipient summary */}
            {selectedRecipient && (
              <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg mb-4 shrink-0">
                <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center shrink-0">
                  <span className="iconify lucide--user size-4 text-base-content/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{recipientName(selectedRecipient)}</p>
                  <p className="text-xs text-base-content/40">
                    {TYPE_LABELS[selectedRecipient.person_type] ?? selectedRecipient.person_type}
                  </p>
                </div>
              </div>
            )}

            {/* Mode selector (hidden for RECIPIENT_SLOT_REQUIRED) */}
            {showModePicker && (
              <div className="flex gap-2 mb-4 shrink-0">
                <button
                  className={`btn btn-sm flex-1 ${timeMode === "open" ? "btn-primary" : "btn-outline"}`}
                  onClick={() => { setTimeMode("open"); setSelectedSlot(null); }}
                >
                  <span className="iconify lucide--calendar-off size-4" />
                  Horario abierto
                </button>
                {schedulingPolicy === "RECIPIENT_SLOT_OPTIONAL" && (
                  <button
                    className={`btn btn-sm flex-1 ${timeMode === "slot" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setTimeMode("slot")}
                  >
                    <span className="iconify lucide--clock size-4" />
                    Seleccionar slot
                  </button>
                )}
                {(schedulingPolicy === "FREE_SCHEDULING" || schedulingPolicy === "NO_SLOT_REQUIRED" || schedulingPolicy === null) && (
                  <button
                    className={`btn btn-sm flex-1 ${timeMode === "manual" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setTimeMode("manual")}
                  >
                    <span className="iconify lucide--calendar-clock size-4" />
                    Selección horario
                  </button>
                )}
              </div>
            )}

            {/* Slot picker */}
            {showSlotPicker && (
              <div className="flex flex-col flex-1 overflow-hidden min-h-0">
                {/* Week navigator */}
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <button
                    className="btn btn-ghost btn-xs btn-circle"
                    disabled={!canGoPrevWeek}
                    onClick={() => {
                      const prev = addDays(slotWeekStart, -7);
                      setSlotWeekStart(prev < todayISO() ? todayISO() : prev);
                      setSelectedSlot(null);
                    }}
                  >
                    <span className="iconify lucide--chevron-left size-4" />
                  </button>
                  <span className="text-xs font-medium text-base-content/70">
                    {fmtWeekRange(slotWeekStart, weekEnd)}
                  </span>
                  <button
                    className="btn btn-ghost btn-xs btn-circle"
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
                  <div className="overflow-y-auto flex-1 space-y-3 pr-1">
                    {activeDays.map((day) => (
                      <div key={day.date}>
                        <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1.5 capitalize">
                          {fmtDateLabel(day.date)}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {day.slots.map((slot, i) => (
                            <button
                              key={i}
                              className={`btn btn-xs ${
                                selectedSlot?.start === slot.start
                                  ? "btn-primary"
                                  : "btn-outline"
                              }`}
                              onClick={() => setSelectedSlot(selectedSlot?.start === slot.start ? null : slot)}
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

            {/* Sin horario – date only */}
            {step === 3 && timeMode === "open" && (
              <div className="form-control shrink-0">
                <label className="label pb-1">
                  <span className="label-text text-sm font-medium">Fecha</span>
                </label>
                <div className="relative">
                  <span className="iconify lucide--calendar size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
                  <input
                    type="date"
                    className="input input-bordered w-full pl-9"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={todayISO()}
                  />
                </div>
              </div>
            )}

            {/* Manual date + time picker */}
            {step === 3 && timeMode === "manual" && (
              <div className="flex flex-col gap-3 shrink-0">
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-sm font-medium">Fecha</span>
                  </label>
                  <div className="relative">
                    <span className="iconify lucide--calendar size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
                    <input
                      type="date"
                      className="input input-bordered w-full pl-9"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={todayISO()}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-sm font-medium">Hora de inicio</span>
                  </label>
                  <TimePicker value={startTime} onChange={setStartTime} />
                </div>

                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-sm font-medium">Duración</span>
                  </label>
                  <select
                    className="select select-bordered"
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

            {submitError && (
              <div className="alert alert-error mt-3 shrink-0">
                <span className="iconify lucide--alert-circle size-4" />
                <span className="text-sm">{submitError}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between mt-4 shrink-0 pt-2 border-t border-base-200">
          <button
            className="btn btn-ghost"
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
            disabled={submitLoading}
          >
            {step === 1 ? "Cancelar" : (
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
              {submitLoading
                ? <><span className="loading loading-spinner loading-sm" /> Creando…</>
                : <><span className="iconify lucide--check size-4" /> Confirmar</>
              }
            </button>
          )}
        </div>
      </div>
      <div className="modal-backdrop" onClick={!submitLoading ? onClose : undefined} />
    </div>
  );
};
