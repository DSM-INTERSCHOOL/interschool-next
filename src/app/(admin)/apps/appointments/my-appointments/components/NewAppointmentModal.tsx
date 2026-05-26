"use client";

import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSchoolStore } from "@/store/useSchoolStore";
import { getOrgConfig } from "@/lib/orgConfig";
import { getAppointmentRecipients } from "@/services/auth.service";
import { createAppointment } from "@/services/appointment.service";
import { IAppointmentRecipient } from "@/interfaces/IAppointment";

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

const recipientName = (r: IAppointmentRecipient) =>
  r.display_name ||
  [r.given_name, r.paternal_name].filter(Boolean).join(" ") ||
  r.person_internal_id ||
  String(r.person_id);

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

export const NewAppointmentModal = ({ onClose, onSuccess }: Props) => {
  const { personId, personType } = useAuth();
  const school = useSchoolStore((s) => s.school);

  // ── Navigation ────────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);

  // ── Step 1: Details ───────────────────────────────────────────────────────────
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [virtualLink, setVirtualLink] = useState("");

  // ── Step 2: Recipient ─────────────────────────────────────────────────────────
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

  // ── Step 3: Time ──────────────────────────────────────────────────────────────
  const [withoutTime, setWithoutTime] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState(30);

  // ── Submit ────────────────────────────────────────────────────────────────────
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Derived ───────────────────────────────────────────────────────────────────
  const allowedTypes: string[] = (() => {
    if (!personType || !school?.inoty_config?.inoty_appointments_config) return [];
    const config = school.inoty_config.inoty_appointments_config[personType];
    if (!config) return [];
    return Object.entries(config)
      .filter(([, policy]) => policy !== null && policy.allowed_target_groups !== "NONE")
      .map(([type]) => type);
  })();

  const noConfig = !school?.inoty_config?.inoty_appointments_config;

  const hasPrev = skip > 0;
  const hasNext = skip + PAGE_LIMIT < total;
  const totalPages = Math.ceil(total / PAGE_LIMIT);
  const currentPage = Math.floor(skip / PAGE_LIMIT) + 1;

  // ── Recipients fetch ──────────────────────────────────────────────────────────
  const fetchRecipients = useCallback(async (type: string | null, query: string, currentSkip: number) => {
    if (!personId || !personType) return;
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;

    setRecipientsLoading(true);
    setRecipientsError(null);
    try {
      const result = await getAppointmentRecipients({
        schoolId,
        personId,
        personType,
        searchTerm: query,
        targetPersonType: type,
        skip: currentSkip,
        limit: PAGE_LIMIT,
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

  const handleTypeClick = (type: string | null) => {
    setSelectedType(type);
    setSkip(0);
    setSelectedRecipient(null);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSkip(0);
    setSelectedRecipient(null);
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!personId || !selectedRecipient) return;
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;

    setSubmitLoading(true);
    setSubmitError(null);
    try {
      let scheduledStart: string;
      let scheduledEnd: string;
      let duration: number;

      if (withoutTime) {
        scheduledStart = `${date}T00:00:00Z`;
        scheduledEnd = `${date}T23:59:59Z`;
        duration = 1439;
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
          host_person_id: String(personId),
          title: title.trim() || null,
          description: description.trim() || null,
          without_time: withoutTime,
          scheduled_start: scheduledStart,
          scheduled_end: scheduledEnd,
          duration_minutes: duration,
          location: location.trim() || null,
          virtual_link: virtualLink.trim() || null,
          notes: null,
          participant_ids: [String(selectedRecipient.person_id)],
        },
      });
      onSuccess?.();
      onClose();
    } catch {
      setSubmitError("No se pudo crear la cita. Intenta de nuevo.");
    } finally {
      setSubmitLoading(false);
    }
  };

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
                step === s
                  ? "bg-primary text-primary-content"
                  : step > s
                  ? "bg-primary/20 text-primary"
                  : "bg-base-300 text-base-content/40"
              }`}>
                {step > s
                  ? <span className="iconify lucide--check size-3.5" />
                  : s}
              </div>
              {s < 3 && (
                <div className={`h-0.5 w-10 transition-colors ${step > s ? "bg-primary/40" : "bg-base-300"}`} />
              )}
            </Fragment>
          ))}
        </div>

        {/* ── Step 1: Details ──────────────────────────────────────────────────── */}
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

        {/* ── Step 2: Recipient ─────────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="flex flex-col flex-1 overflow-hidden min-h-0">
            <p className="text-sm text-base-content/60 mb-3 shrink-0">
              ¿Con qué persona deseas agendar la cita?
            </p>

            <div className="shrink-0">
              {noConfig ? (
                <div className="alert alert-warning">
                  <span className="iconify lucide--alert-triangle size-5" />
                  <span className="text-sm">
                    Configuración de escuela no disponible. Cierra sesión y vuelve a entrar.
                  </span>
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
                  placeholder={
                    selectedType
                      ? `Buscar ${TYPE_LABELS[selectedType] ?? selectedType}…`
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
                          onClick={() =>
                            setSelectedRecipient(
                              selectedRecipient?.person_id === r.person_id ? null : r
                            )
                          }
                        >
                          <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center shrink-0">
                            <span className="iconify lucide--user size-4 text-base-content/50" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{recipientName(r)}</p>
                            <p className="text-xs text-base-content/50 truncate">
                              {r.person_internal_id && (
                                <span className="mr-2">{r.person_internal_id}</span>
                              )}
                              {r.job_position && <span>{r.job_position}</span>}
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

        {/* ── Step 3: Time ──────────────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
            {selectedRecipient && (
              <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg shrink-0">
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

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={withoutTime}
                  onChange={(e) => setWithoutTime(e.target.checked)}
                />
                <span className="label-text text-sm">Sin hora específica (todo el día)</span>
              </label>
            </div>

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
                  min={new Date().toISOString().slice(0, 10)}
                />
              </div>
            </div>

            {!withoutTime && (
              <>
                <div className="form-control">
                  <label className="label pb-1">
                    <span className="label-text text-sm font-medium">Hora de inicio</span>
                  </label>
                  <div className="relative">
                    <span className="iconify lucide--clock size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
                    <input
                      type="time"
                      className="input input-bordered w-full pl-9"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
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
              </>
            )}

            {submitError && (
              <div className="alert alert-error">
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
              onClick={() => setStep(step + 1)}
            >
              Siguiente
              <span className="iconify lucide--arrow-right size-4" />
            </button>
          ) : (
            <button
              className="btn btn-primary"
              disabled={!date || submitLoading}
              onClick={handleSubmit}
            >
              {submitLoading ? (
                <><span className="loading loading-spinner loading-sm" /> Creando…</>
              ) : (
                <><span className="iconify lucide--check size-4" /> Confirmar</>
              )}
            </button>
          )}
        </div>
      </div>
      <div className="modal-backdrop" onClick={!submitLoading ? onClose : undefined} />
    </div>
  );
};
