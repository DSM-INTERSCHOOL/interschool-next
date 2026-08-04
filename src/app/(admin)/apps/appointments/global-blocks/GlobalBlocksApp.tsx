"use client";

import { useEffect } from "react";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useGlobalBlocks } from "./hooks";
import { GlobalBlockForm, GlobalBlockList } from "./components";

export const GlobalBlocksApp = () => {
  const {
    blocks,
    loading,
    error,
    modalOpen,
    editingBlock,
    formData,
    saveLoading,
    saveError,
    deleteConfirmId,
    deleteLoading,
    loadBlocks,
    updateField,
    openCreate,
    openEdit,
    closeModal,
    handleSave,
    setDeleteConfirmId,
    handleDelete,
  } = useGlobalBlocks();

  useEffect(() => {
    document.title = "Bloqueos Globales - Interschool";
    loadBlocks();
  }, []);

  const blockToDelete = blocks.find((b) => b.id === deleteConfirmId);

  return (
    <>
      <PageTitle
        title="Bloqueos Globales"
        items={[
          { label: "Apps" },
          { label: "Reuniones" },
          { label: "Bloqueos Globales", active: true },
        ]}
      />

      <div className="mt-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title text-2xl">
                <span className="iconify lucide--calendar-off size-6" />
                Bloqueos Globales
              </h2>
              <button className="btn btn-primary" onClick={openCreate}>
                <span className="iconify lucide--plus size-5" />
                Nuevo bloqueo
              </button>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner message="Cargando bloqueos…" />
              </div>
            ) : error ? (
              <div className="alert alert-error">
                <span className="iconify lucide--alert-circle size-6" />
                <div>
                  <h3 className="font-bold">Error</h3>
                  <div className="text-sm">{error}</div>
                </div>
                <button className="btn btn-sm btn-ghost" onClick={loadBlocks}>
                  Reintentar
                </button>
              </div>
            ) : (
              <GlobalBlockList
                blocks={blocks}
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
            {/* Modal header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="iconify lucide--calendar-off size-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-xl">
                    {editingBlock ? "Editar bloqueo" : "Nuevo bloqueo"}
                  </h3>
                  {editingBlock && (
                    <p className="text-sm text-base-content/60">
                      {editingBlock.name}
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

            <GlobalBlockForm
              formData={formData}
              saveLoading={saveLoading}
              saveError={saveError}
              isEditing={!!editingBlock}
              onFieldChange={updateField}
              onSave={handleSave}
              onCancel={closeModal}
            />
          </div>
          <div className="modal-backdrop" onClick={!saveLoading ? closeModal : undefined} />
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
              <h3 className="font-bold text-lg">Eliminar bloqueo</h3>
            </div>
            <p className="text-base-content/70 mb-1">
              ¿Deseas eliminar el siguiente bloqueo?
            </p>
            {blockToDelete && (
              <p className="font-semibold mb-4">{blockToDelete.name}</p>
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
          <div className="modal-backdrop" onClick={() => !deleteLoading && setDeleteConfirmId(null)} />
        </div>
      )}
    </>
  );
};
