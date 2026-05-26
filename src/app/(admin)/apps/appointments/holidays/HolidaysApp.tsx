"use client";

import { useEffect } from "react";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useHolidays } from "./hooks";
import { HolidayForm, HolidayList } from "./components";

export const HolidaysApp = () => {
  const {
    holidays,
    loading,
    error,
    modalOpen,
    editingHoliday,
    formData,
    saveLoading,
    saveError,
    deleteConfirmId,
    deleteLoading,
    applyModalOpen,
    applyForm,
    applyLoading,
    applyError,
    applyResult,
    loadHolidays,
    updateField,
    openCreate,
    openEdit,
    closeModal,
    handleSave,
    setDeleteConfirmId,
    handleDelete,
    openApplyModal,
    closeApplyModal,
    updateApplyField,
    handleApply,
  } = useHolidays();

  useEffect(() => {
    document.title = "Días Festivos - Interschool";
    loadHolidays();
  }, []);

  const holidayToDelete = holidays.find((h) => h.id === deleteConfirmId);

  return (
    <>
      <PageTitle
        title="Días Festivos"
        items={[
          { label: "Apps" },
          { label: "Citas" },
          { label: "Días Festivos", active: true },
        ]}
      />

      <div className="mt-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title text-2xl">
                <span className="iconify lucide--sun size-6" />
                Días Festivos
              </h2>
              <div className="flex gap-2">
                <button className="btn btn-outline" onClick={openApplyModal}>
                  <span className="iconify lucide--calendar-check size-5" />
                  Aplicar al año
                </button>
                <button className="btn btn-primary" onClick={openCreate}>
                  <span className="iconify lucide--plus size-5" />
                  Nuevo día festivo
                </button>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner message="Cargando días festivos…" />
              </div>
            ) : error ? (
              <div className="alert alert-error">
                <span className="iconify lucide--alert-circle size-6" />
                <div>
                  <h3 className="font-bold">Error</h3>
                  <div className="text-sm">{error}</div>
                </div>
                <button className="btn btn-sm btn-ghost" onClick={loadHolidays}>
                  Reintentar
                </button>
              </div>
            ) : (
              <HolidayList
                holidays={holidays}
                onEdit={openEdit}
                onDelete={setDeleteConfirmId}
              />
            )}
          </div>
        </div>
      </div>

      {/* Create / Edit modal */}
      {modalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="iconify lucide--sun size-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">
                    {editingHoliday ? "Editar día festivo" : "Nuevo día festivo"}
                  </h3>
                  {editingHoliday && (
                    <p className="text-sm text-base-content/60">
                      {editingHoliday.name}
                    </p>
                  )}
                </div>
              </div>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={closeModal}
                disabled={saveLoading}
              >
                <span className="iconify lucide--x size-5" />
              </button>
            </div>

            <HolidayForm
              formData={formData}
              saveLoading={saveLoading}
              saveError={saveError}
              isEditing={!!editingHoliday}
              onFieldChange={updateField}
              onSave={handleSave}
              onCancel={closeModal}
            />
          </div>
          <div
            className="modal-backdrop"
            onClick={!saveLoading ? closeModal : undefined}
          />
        </div>
      )}

      {/* Apply-to-year modal */}
      {applyModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <span className="iconify lucide--calendar-check size-5 text-secondary" />
                </div>
                <h3 className="font-bold text-xl">Aplicar al año</h3>
              </div>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={closeApplyModal}
                disabled={applyLoading}
              >
                <span className="iconify lucide--x size-5" />
              </button>
            </div>

            {applyResult !== null ? (
              <div className="space-y-4">
                <div className="alert alert-success">
                  <span className="iconify lucide--circle-check size-6" />
                  <div>
                    <h3 className="font-bold">¡Días festivos aplicados!</h3>
                    <div className="text-sm">
                      Se crearon <strong>{applyResult}</strong> bloqueo
                      {applyResult !== 1 ? "s" : ""} globales para el año{" "}
                      <strong>{applyForm.year}</strong>.
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button className="btn btn-primary" onClick={closeApplyModal}>
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Year */}
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Año</legend>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    min={2000}
                    max={2100}
                    value={applyForm.year}
                    onChange={(e) =>
                      updateApplyField("year", Number(e.target.value))
                    }
                  />
                </fieldset>

                {/* Block type */}
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">Tipo de bloqueo</legend>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={applyForm.block_type}
                    onChange={(e) =>
                      updateApplyField("block_type", e.target.value)
                    }
                  />
                </fieldset>

                {/* Applies to all */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={applyForm.applies_to_all}
                    onChange={(e) =>
                      updateApplyField("applies_to_all", e.target.checked)
                    }
                  />
                  <div>
                    <p className="font-medium text-sm">Aplica a todos</p>
                    <p className="text-xs text-base-content/50">
                      Los bloqueos se aplicarán a toda la escuela
                    </p>
                  </div>
                </label>

                {!applyForm.applies_to_all && (
                  <div className="alert alert-info">
                    <span className="iconify lucide--info size-5" />
                    <span className="text-sm">
                      Los bloqueos se crearán sin personas asignadas. Podrás
                      agregar personas específicas desde Bloqueos Globales.
                    </span>
                  </div>
                )}

                {applyError && (
                  <div className="alert alert-error">
                    <span className="iconify lucide--alert-circle size-5" />
                    <span className="text-sm">{applyError}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    className="btn btn-ghost"
                    onClick={closeApplyModal}
                    disabled={applyLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={handleApply}
                    disabled={applyLoading}
                  >
                    {applyLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm" />
                        Aplicando…
                      </>
                    ) : (
                      <>
                        <span className="iconify lucide--calendar-check size-4" />
                        Aplicar
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          <div
            className="modal-backdrop"
            onClick={!applyLoading ? closeApplyModal : undefined}
          />
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirmId && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                <span className="iconify lucide--trash-2 size-5 text-error" />
              </div>
              <h3 className="font-bold text-lg">Eliminar día festivo</h3>
            </div>
            <p className="text-base-content/70 mb-1">
              ¿Deseas eliminar el siguiente día festivo?
            </p>
            {holidayToDelete && (
              <p className="font-semibold mb-4">{holidayToDelete.name}</p>
            )}
            <p className="text-sm text-base-content/50 mb-6">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-ghost"
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleteLoading}
              >
                Cancelar
              </button>
              <button
                className="btn btn-error"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm" />
                    Eliminando…
                  </>
                ) : (
                  <>
                    <span className="iconify lucide--trash-2 size-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => !deleteLoading && setDeleteConfirmId(null)}
          />
        </div>
      )}
    </>
  );
};
