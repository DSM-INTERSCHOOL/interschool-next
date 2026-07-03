"use client";

import { useEffect, useState } from "react";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { useMyAvailability, useMyAppointments } from "./hooks";
import { AppointmentsList, NewAppointmentModal, AppointmentDetailModal, ProposedSlotPickerModal } from "./components";
import { IAppointmentRead } from "@/interfaces/IAppointment";
import {
  AvailabilitySettings,
  RulesPanel,
  RuleForm,
  ExceptionsPanel,
  ExceptionForm,
} from "../availability/components";

export const MyAppointmentsApp = () => {
  const { personId, name } = useAuth();
  const pid = personId?.toString() ?? null;

  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<IAppointmentRead | null>(null);

  const {
    appointments, loading: apptLoading, error: apptError,
    viewYear, viewMonth, prevMonth, nextMonth, reload,
  } = useMyAppointments(pid);

  const {
    availability, loading, error, notFound,
    settingsForm, settingsSaveLoading, settingsSaveError,
    updateSettingsField, handleSaveSettings,
    ruleModalOpen, editingRule, ruleForm, ruleSaveLoading, ruleSaveError,
    updateRuleField, openAddRule, openEditRule, closeRuleModal, handleSaveRule,
    deleteRuleId, deleteRuleLoading, setDeleteRuleId, handleDeleteRule,
    exceptionModalOpen, editingException, exceptionForm, exceptionSaveLoading, exceptionSaveError,
    updateExceptionField, openAddException, openEditException, closeExceptionModal, handleSaveException,
    deleteExceptionId, deleteExceptionLoading, setDeleteExceptionId, handleDeleteException,
  } = useMyAvailability(pid);

  useEffect(() => {
    document.title = "Mis Reuniones - Interschool";
  }, []);

  const ruleToDelete = availability?.rules.find((r) => r.id === deleteRuleId);
  const exceptionToDelete = availability?.exceptions.find((e) => e.id === deleteExceptionId);
  const showSpecific = !loading && !error && !notFound && settingsForm.availability_type === "SPECIFIC";

  return (
    <>
      <PageTitle
        items={[{ label: "Apps" }, { label: "Reuniones" }, { label: "Mis Reuniones", active: true }]}
      />

      <div className="mt-6 space-y-4">

        {/* ── Appointments list ────────────────────────────────────────── */}
        <AppointmentsList
          appointments={appointments}
          loading={apptLoading}
          error={apptError}
          viewYear={viewYear}
          viewMonth={viewMonth}
          onPrev={prevMonth}
          onNext={nextMonth}
          onAdd={() => setAddModalOpen(true)}
          personId={pid}
          onReload={reload}
          onSelect={setSelectedAppointment}
          onAvailability={() => setAvailabilityOpen(true)}
        />

      </div>

      {/* ── New appointment modal ───────────────────────────────────────── */}
      {addModalOpen && (
        <NewAppointmentModal
          onClose={() => setAddModalOpen(false)}
          onSuccess={() => { setAddModalOpen(false); reload(); }}
        />
      )}

      {/* ── Appointment detail / slot-picker modal ──────────────────────── */}
      {selectedAppointment && (() => {
        const needsSlotPick =
          selectedAppointment.status !== "CONFIRMED" &&
          !selectedAppointment.scheduled_start &&
          !selectedAppointment.scheduled_end &&
          (selectedAppointment.proposed_slots?.length ?? 0) > 0 &&
          selectedAppointment.participants.some(
            (p) => String(p.person_id) === String(pid) && p.role === "ATTENDEE" && !p.removed_at
          );
        return needsSlotPick ? (
          <ProposedSlotPickerModal
            appointment={selectedAppointment}
            personId={pid}
            onClose={() => setSelectedAppointment(null)}
            onConfirmed={() => { reload(); setSelectedAppointment(null); }}
          />
        ) : (
          <AppointmentDetailModal
            appointment={selectedAppointment}
            personId={pid}
            onClose={() => setSelectedAppointment(null)}
            onUpdate={() => { reload(); setSelectedAppointment(null); }}
          />
        );
      })()}

      {/* ── Availability modal ───────────────────────────────────────────── */}
      {availabilityOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-base-100 pb-4 border-b border-base-200 z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="iconify lucide--settings-2 size-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Mi disponibilidad</h3>
                  {name && <p className="text-xs text-base-content/50">{name}</p>}
                </div>
              </div>
              <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setAvailabilityOpen(false)}>
                <span className="iconify lucide--x size-5" />
              </button>
            </div>

            {/* Body */}
            {loading && (
              <div className="flex justify-center py-12">
                <LoadingSpinner message="Cargando disponibilidad…" />
              </div>
            )}

            {error && (
              <div className="alert alert-error mb-4">
                <span className="iconify lucide--alert-circle size-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {!loading && !error && (
              <div className="space-y-4">
                <AvailabilitySettings
                  availability={availability}
                  notFound={notFound}
                  personId={pid ?? ""}
                  settingsForm={settingsForm}
                  saveLoading={settingsSaveLoading}
                  saveError={settingsSaveError}
                  onFieldChange={updateSettingsField}
                  onSave={handleSaveSettings}
                />

                {settingsForm.availability_type === "OPEN" && !notFound && (
                  <div className="alert alert-info">
                    <span className="iconify lucide--unlock size-5" />
                    <span className="text-sm">
                      Agenda abierta — estás siempre disponible. Las reglas semanales no aplican.
                    </span>
                  </div>
                )}

                {showSpecific && (
                  <RulesPanel
                    rules={availability?.rules ?? []}
                    onAdd={openAddRule}
                    onEdit={openEditRule}
                    onDelete={setDeleteRuleId}
                  />
                )}

                {!notFound && (
                  <ExceptionsPanel
                    exceptions={availability?.exceptions ?? []}
                    onAdd={openAddException}
                    onEdit={openEditException}
                    onDelete={setDeleteExceptionId}
                  />
                )}
              </div>
            )}
          </div>
          <div className="modal-backdrop" onClick={() => setAvailabilityOpen(false)} />
        </div>
      )}

      {/* ── Rule form modal ──────────────────────────────────────────────── */}
      {ruleModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="iconify lucide--clock size-4 text-primary" />
                </div>
                <h3 className="font-bold text-xl">
                  {editingRule ? "Editar regla" : "Agregar regla"}
                </h3>
              </div>
              <button className="btn btn-sm btn-circle btn-ghost" onClick={closeRuleModal} disabled={ruleSaveLoading}>
                <span className="iconify lucide--x size-5" />
              </button>
            </div>
            <RuleForm
              formData={ruleForm}
              saveLoading={ruleSaveLoading}
              saveError={ruleSaveError}
              isEditing={!!editingRule}
              onFieldChange={updateRuleField}
              onSave={handleSaveRule}
              onCancel={closeRuleModal}
            />
          </div>
          <div className="modal-backdrop" onClick={!ruleSaveLoading ? closeRuleModal : undefined} />
        </div>
      )}

      {/* ── Exception form modal ─────────────────────────────────────────── */}
      {exceptionModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-error/10 flex items-center justify-center">
                  <span className="iconify lucide--calendar-x size-4 text-error" />
                </div>
                <h3 className="font-bold text-xl">
                  {editingException ? "Editar excepción" : "Agregar excepción"}
                </h3>
              </div>
              <button className="btn btn-sm btn-circle btn-ghost" onClick={closeExceptionModal} disabled={exceptionSaveLoading}>
                <span className="iconify lucide--x size-5" />
              </button>
            </div>
            <ExceptionForm
              formData={exceptionForm}
              saveLoading={exceptionSaveLoading}
              saveError={exceptionSaveError}
              isEditing={!!editingException}
              onFieldChange={updateExceptionField}
              onSave={handleSaveException}
              onCancel={closeExceptionModal}
            />
          </div>
          <div className="modal-backdrop" onClick={!exceptionSaveLoading ? closeExceptionModal : undefined} />
        </div>
      )}

      {/* ── Delete rule confirmation ─────────────────────────────────────── */}
      {deleteRuleId && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                <span className="iconify lucide--trash-2 size-5 text-error" />
              </div>
              <h3 className="font-bold text-lg">Eliminar regla</h3>
            </div>
            {ruleToDelete && (
              <p className="text-sm text-base-content/70 mb-4">
                Regla para los días{" "}
                <strong>
                  {["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"]
                    .filter((_, i) => ruleToDelete.days_of_week.includes(i))
                    .join(", ")}
                </strong>{" "}
                de {ruleToDelete.start_time.slice(0, 5)} a {ruleToDelete.end_time.slice(0, 5)}.
              </p>
            )}
            <p className="text-sm text-base-content/50 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-2">
              <button className="btn btn-ghost" onClick={() => setDeleteRuleId(null)} disabled={deleteRuleLoading}>
                Cancelar
              </button>
              <button className="btn btn-error" onClick={() => handleDeleteRule(deleteRuleId)} disabled={deleteRuleLoading}>
                {deleteRuleLoading ? <><span className="loading loading-spinner loading-sm" /> Eliminando…</> : <><span className="iconify lucide--trash-2 size-4" /> Eliminar</>}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => !deleteRuleLoading && setDeleteRuleId(null)} />
        </div>
      )}

      {/* ── Delete exception confirmation ────────────────────────────────── */}
      {deleteExceptionId && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                <span className="iconify lucide--trash-2 size-5 text-error" />
              </div>
              <h3 className="font-bold text-lg">Eliminar excepción</h3>
            </div>
            {exceptionToDelete && (
              <p className="text-sm text-base-content/70 mb-4">
                <span className="font-semibold">
                  {exceptionToDelete.exception_type === "UNAVAILABLE" ? "No disponible" : "Horario especial"}
                </span>
                {exceptionToDelete.reason && ` — "${exceptionToDelete.reason}"`}
              </p>
            )}
            <p className="text-sm text-base-content/50 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-2">
              <button className="btn btn-ghost" onClick={() => setDeleteExceptionId(null)} disabled={deleteExceptionLoading}>
                Cancelar
              </button>
              <button className="btn btn-error" onClick={() => handleDeleteException(deleteExceptionId)} disabled={deleteExceptionLoading}>
                {deleteExceptionLoading ? <><span className="loading loading-spinner loading-sm" /> Eliminando…</> : <><span className="iconify lucide--trash-2 size-4" /> Eliminar</>}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => !deleteExceptionLoading && setDeleteExceptionId(null)} />
        </div>
      )}
    </>
  );
};
