"use client";

import { useState } from "react";
import { IAppointmentRead, IProposedSlot, IAppointmentParticipant } from "@/interfaces/IAppointment";
import { updateAppointment, updateParticipantStatus } from "@/services/appointment.service";
import { getOrgConfig } from "@/lib/orgConfig";
import { getApiErrorMessage } from "@/lib/apiError";

// ── Helpers ───────────────────────────────────────────────────────────────────

const personName = (p: IAppointmentParticipant["person"]) =>
  [p.given_name, p.paternal_surname].filter(Boolean).join(" ") || p.person_internal_id || p.id;

const fmtSlot = (slot: IProposedSlot) => {
  const start = new Date(slot.start_datetime);
  const end   = new Date(slot.end_datetime);
  const duration = Math.round((end.getTime() - start.getTime()) / 60_000);
  const date      = start.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
  const startTime = start.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true });
  const endTime   = end.toLocaleTimeString("es-MX",   { hour: "2-digit", minute: "2-digit", hour12: true });
  return { date, startTime, endTime, duration };
};

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  appointment: IAppointmentRead;
  personId: string | null;
  onClose: () => void;
  onConfirmed: () => void;
}

export const ProposedSlotPickerModal = ({ appointment: appt, personId, onClose, onConfirmed }: Props) => {
  const [selectedSlot, setSelectedSlot] = useState<IProposedSlot | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const slots = appt.proposed_slots ?? [];
  const activeParticipants = appt.participants.filter((p) => !p.removed_at);
  const organizer = activeParticipants.find((p) => p.role === "ORGANIZER");

  const handleConfirm = async () => {
    if (!selectedSlot || !personId) return;
    const { schoolId } = getOrgConfig();
    if (!schoolId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const duration = Math.round(
        (new Date(selectedSlot.end_datetime).getTime() - new Date(selectedSlot.start_datetime).getTime()) / 60_000
      );
      // Set the appointment schedule from the chosen slot
      await updateAppointment({
        schoolId,
        appointmentId: appt.id,
        dto: {
          without_time: false,
          scheduled_start: selectedSlot.start_datetime,
          scheduled_end: selectedSlot.end_datetime,
          duration_minutes: duration,
        },
      });
      // Confirm the participant's attendance in the same action
      await updateParticipantStatus({
        schoolId,
        appointmentId: appt.id,
        personId,
        status: "CONFIRMED",
      });
      onConfirmed();
    } catch (err) {
      setSaveError(getApiErrorMessage(err, "No se pudo confirmar el horario. Intenta de nuevo."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-sm flex flex-col" style={{ maxHeight: "85vh" }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-4 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="iconify lucide--alarm-clock size-4 text-info" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">Seleccionar horario</h3>
              <p className="text-xs text-base-content/50 mt-0.5 truncate max-w-[14rem]">
                {appt.title ?? "Cita sin título"}
              </p>
            </div>
          </div>
          <button
            className="btn btn-sm btn-circle btn-ghost shrink-0 ml-2"
            onClick={onClose}
            disabled={saving}
          >
            <span className="iconify lucide--x size-5" />
          </button>
        </div>

        {/* ── Organizer chip ───────────────────────────────────────────────── */}
        {organizer && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-base-200 mb-4 shrink-0">
            <span className="iconify lucide--shield size-3.5 text-base-content/40 shrink-0" />
            <span className="text-xs text-base-content/60">
              Solicitud de{" "}
              <span className="font-semibold text-base-content/80">
                {personName(organizer.person)}
              </span>
            </span>
          </div>
        )}

        {/* ── Description ─────────────────────────────────────────────────── */}
        <p className="text-sm text-base-content/55 mb-3 shrink-0">
          Elige uno de los horarios propuestos para confirmar la cita.
        </p>

        {/* ── Slot list ───────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-0.5">
          {slots.map((slot, i) => {
            const { date, startTime, endTime, duration } = fmtSlot(slot);
            const isPast    = new Date(slot.start_datetime) < new Date();
            const isSelected = selectedSlot === slot;
            const isDisabled = saving || isPast;
            return (
              <button
                key={i}
                disabled={isDisabled}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  isPast
                    ? "border-base-200 opacity-45 cursor-not-allowed"
                    : isSelected
                      ? "border-success bg-success/8"
                      : "border-base-200 hover:border-base-300"
                }`}
                onClick={() => !isPast && setSelectedSlot(isSelected ? null : slot)}
              >
                {/* Radio circle */}
                <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                  isPast
                    ? "border-base-300 bg-base-200"
                    : isSelected
                      ? "border-success bg-success"
                      : "border-base-300"
                }`}>
                  {isSelected && !isPast && (
                    <span className="iconify lucide--check size-2.5 text-success-content" />
                  )}
                </div>

                {/* Slot details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium capitalize leading-snug ${
                      isPast ? "text-base-content/40 line-through" : isSelected ? "text-success" : "text-base-content"
                    }`}>
                      {date}
                    </p>
                    {isPast && (
                      <span className="badge badge-xs badge-ghost text-base-content/40">Pasado</span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${isPast ? "text-base-content/30" : isSelected ? "text-success/70" : "text-base-content/50"}`}>
                    <span className="iconify lucide--clock size-3.5 inline mr-0.5" />
                    {startTime} – {endTime}
                    <span className="ml-1.5 opacity-70">({duration} min)</span>
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {saveError && (
          <div className="alert alert-error py-2 mt-3 shrink-0">
            <span className="iconify lucide--alert-circle size-4" />
            <span className="text-xs">{saveError}</span>
          </div>
        )}

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-base-200 shrink-0">
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button
            className="btn btn-success btn-sm"
            disabled={!selectedSlot || saving}
            onClick={handleConfirm}
          >
            {saving
              ? <><span className="loading loading-spinner loading-xs" /> Confirmando…</>
              : <><span className="iconify lucide--check size-4" /> Confirmar horario</>
            }
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={!saving ? onClose : undefined} />
    </div>
  );
};
