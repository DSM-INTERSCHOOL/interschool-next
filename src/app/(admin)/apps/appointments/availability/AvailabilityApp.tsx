"use client";

import { useEffect, KeyboardEvent } from "react";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAvailability } from "./hooks";
import {
  AvailabilitySettings,
  RulesPanel,
  RuleForm,
  ExceptionsPanel,
  ExceptionForm,
} from "./components";

export const AvailabilityApp = () => {
  const {
    personIdInput, setPersonIdInput,
    selectedPersonId,
    availability, loading, error, notFound,
    settingsForm, settingsSaveLoading, settingsSaveError,
    updateSettingsField, handleSaveSettings,
    ruleModalOpen, editingRule, ruleForm, ruleSaveLoading, ruleSaveError,
    updateRuleField, openAddRule, openEditRule, closeRuleModal, handleSaveRule,
    deleteRuleId, deleteRuleLoading, setDeleteRuleId, handleDeleteRule,
    exceptionModalOpen, editingException, exceptionForm, exceptionSaveLoading, exceptionSaveError,
    updateExceptionField, openAddException, openEditException, closeExceptionModal, handleSaveException,
    deleteExceptionId, deleteExceptionLoading, setDeleteExceptionId, handleDeleteException,
    slotFinderOpen, setSlotFinderOpen,
    slotForm, slots, slotsLoading, slotsError, slotsSearched,
    updateSlotField, handleFindSlots,
    handleSearch,
  } = useAvailability();

  useEffect(() => {
    document.title = "Disponibilidad - Interschool";
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const ruleToDelete = availability?.rules.find((r) => r.id === deleteRuleId);
  const exceptionToDelete = availability?.exceptions.find((e) => e.id === deleteExceptionId);
  const showSpecific = selectedPersonId && !loading && !error && settingsForm.availability_type === "SPECIFIC";

  return (
    <>
      <PageTitle
        title="Disponibilidad"
        items={[{ label: "Apps" }, { label: "Reuniones" }, { label: "Disponibilidad", active: true }]}
      />

      <div className="mt-6 space-y-4">

        {/* ── Person search ─────────────────────────────────────────── */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">
              <span className="iconify lucide--user-check size-6" />
              Disponibilidad por persona
            </h2>
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                className="input input-bordered flex-1"
                placeholder="ID de persona"
                value={personIdInput}
                onChange={(e) => setPersonIdInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="btn btn-primary"
                onClick={handleSearch}
                disabled={!personIdInput.trim() || loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <span className="iconify lucide--search size-4" />
                )}
                Buscar
              </button>
            </div>
          </div>
        </div>

        {/* ── Loading / error ───────────────────────────────────────── */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner message="Cargando disponibilidad…" />
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <span className="iconify lucide--alert-circle size-6" />
            <div>
              <h3 className="font-bold">Error</h3>
              <div className="text-sm">{error}</div>
            </div>
          </div>
        )}

        {/* ── Availability panels ───────────────────────────────────── */}
        {selectedPersonId && !loading && !error && (
          <>
            <AvailabilitySettings
              availability={availability}
              notFound={notFound}
              personId={selectedPersonId}
              settingsForm={settingsForm}
              saveLoading={settingsSaveLoading}
              saveError={settingsSaveError}
              onFieldChange={updateSettingsField}
              onSave={handleSaveSettings}
            />

            {/* OPEN info note */}
            {settingsForm.availability_type === "OPEN" && !notFound && (
              <div className="alert alert-info">
                <span className="iconify lucide--unlock size-5" />
                <span className="text-sm">
                  Agenda abierta — esta persona está siempre disponible. Las reglas semanales no aplican.
                </span>
              </div>
            )}

            {/* Rules — only for SPECIFIC */}
            {showSpecific && (
              <RulesPanel
                rules={availability?.rules ?? []}
                onAdd={openAddRule}
                onEdit={openEditRule}
                onDelete={setDeleteRuleId}
              />
            )}

            {/* Exceptions — always shown when person is loaded */}
            {!notFound && (
              <ExceptionsPanel
                exceptions={availability?.exceptions ?? []}
                onAdd={openAddException}
                onEdit={openEditException}
                onDelete={setDeleteExceptionId}
              />
            )}
          </>
        )}

        {/* ── Slot finder ───────────────────────────────────────────── */}
        <div className="card bg-base-100 border border-base-300">
          <div
            className="card-body cursor-pointer select-none"
            onClick={() => setSlotFinderOpen(!slotFinderOpen)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="iconify lucide--calendar-search size-5 text-secondary" />
                <h3 className="font-bold text-lg">Buscador de horarios libres</h3>
              </div>
              <span className={`iconify size-5 transition-transform ${slotFinderOpen ? "lucide--chevron-up" : "lucide--chevron-down"}`} />
            </div>
          </div>

          {slotFinderOpen && (
            <div className="px-6 pb-6 space-y-4 border-t border-base-200 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Persona 1 (ID)</legend>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={slotForm.personId1}
                    onChange={(e) => updateSlotField("personId1", e.target.value)}
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Persona 2 (ID)</legend>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={slotForm.personId2}
                    onChange={(e) => updateSlotField("personId2", e.target.value)}
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Fecha objetivo</legend>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={slotForm.targetDate}
                    onChange={(e) => updateSlotField("targetDate", e.target.value)}
                  />
                </fieldset>
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Duración (min)</legend>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    min={5}
                    step={5}
                    value={slotForm.durationMinutes}
                    onChange={(e) => updateSlotField("durationMinutes", Number(e.target.value))}
                  />
                </fieldset>
              </div>

              <button
                className="btn btn-secondary"
                onClick={handleFindSlots}
                disabled={slotsLoading}
              >
                {slotsLoading ? (
                  <><span className="loading loading-spinner loading-sm" /> Buscando…</>
                ) : (
                  <><span className="iconify lucide--search size-4" /> Buscar horarios</>
                )}
              </button>

              {slotsError && (
                <div className="alert alert-error">
                  <span className="iconify lucide--alert-circle size-5" />
                  <span className="text-sm">{slotsError}</span>
                </div>
              )}

              {slotsSearched && !slotsLoading && (
                slots.length === 0 ? (
                  <div className="text-center py-6 text-base-content/50 text-sm">
                    No hay horarios disponibles para los criterios seleccionados.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-base-content/70">
                      {slots.length} horario{slots.length !== 1 ? "s" : ""} disponible{slots.length !== 1 ? "s" : ""}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                      {slots.map((slot, i) => (
                        <div key={i} className="badge badge-outline badge-lg gap-1 py-3">
                          <span className="iconify lucide--clock size-3.5" />
                          {new Date(slot.start).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true })}
                          {" – "}
                          {new Date(slot.end).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: true })}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Rule form modal ─────────────────────────────────────────── */}
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

      {/* ── Exception form modal ────────────────────────────────────── */}
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

      {/* ── Delete rule confirmation ────────────────────────────────── */}
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

      {/* ── Delete exception confirmation ───────────────────────────── */}
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
