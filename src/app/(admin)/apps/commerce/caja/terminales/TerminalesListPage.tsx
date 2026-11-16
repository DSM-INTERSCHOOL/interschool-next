"use client";

import { useState } from "react";
import { AppLink as Link } from "@/components/AppLink";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { useTerminals } from "./hooks";

export default function TerminalesListPage() {
  const { terminals, loading, error, removeTerminal } = useTerminals();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const terminalToDelete = terminals.find((terminal) => terminal.id === deleteId) ?? null;

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      setDeleteLoading(true);
      await removeTerminal(deleteId);
      setDeleteId(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || "Error al eliminar la terminal");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <PageTitle
        title="Terminales"
      />
      <div className="mt-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner message="Cargando terminales..." />
              </div>
            ) : error ? (
              <div className="alert alert-error">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>{error}</div>
              </div>
            ) : terminals.length === 0 ? (
              <div className="text-center py-16">
                <span className="iconify lucide--monitor-smartphone size-24 text-base-content/20 mb-4"></span>
                <h3 className="text-xl font-medium text-base-content mb-2">No hay terminales registradas</h3>
                <p className="text-base-content/60">
                  Las terminales se registran solas la primera vez que se abre Cobros en ese equipo
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Device ID</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {terminals.map((terminal) => (
                      <tr key={terminal.id}>
                        <td className="font-medium">{terminal.name}</td>
                        <td className="text-sm text-base-content/60">{terminal.device_id}</td>
                        <td>
                          <div className="flex justify-end gap-1">
                            <Link
                              href={`/apps/commerce/caja/terminales/${terminal.id}`}
                              className="btn btn-ghost btn-xs"
                              title="Editar"
                            >
                              <span className="iconify lucide--pencil size-4"></span>
                            </Link>
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              title="Eliminar"
                              onClick={() => setDeleteId(terminal.id)}
                            >
                              <span className="iconify lucide--trash-2 size-4"></span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar terminal"
        message="¿Estás seguro de que deseas eliminar esta terminal?"
        itemName={terminalToDelete?.name}
        loading={deleteLoading}
      />
    </>
  );
}
