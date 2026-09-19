"use client";

import { useState } from "react";
import { AppLink as Link } from "@/components/AppLink";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { useColors } from "./hooks";

export default function ColorsListPage() {
  const { colors, loading, error, removeColor } = useColors();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const colorToDelete = colors.find((color) => color.id === deleteId) ?? null;

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      setDeleteLoading(true);
      await removeColor(deleteId);
      setDeleteId(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || "Error al eliminar el color");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <PageTitle
        title="Colores"
        items={[{ label: "Apps" }, { label: "Comercio" }, { label: "Colores", active: true }]}
      />
      <div className="mt-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-2xl">
                <span className="iconify lucide--palette size-6"></span>
                Catálogo de Colores
              </h2>
              <Link href="/apps/commerce/colors/create" className="btn btn-primary">
                <span className="iconify lucide--plus size-5"></span>
                Nuevo Color
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner message="Cargando colores..." />
              </div>
            ) : error ? (
              <div className="alert alert-error">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>{error}</div>
              </div>
            ) : colors.length === 0 ? (
              <div className="text-center py-16">
                <span className="iconify lucide--palette size-24 text-base-content/20 mb-4"></span>
                <h3 className="text-xl font-medium text-base-content mb-2">No hay colores</h3>
                <p className="text-base-content/60 mb-6">Crea tu primer color para comenzar</p>
                <Link href="/apps/commerce/colors/create" className="btn btn-primary btn-sm">
                  <span className="iconify lucide--plus size-4"></span>
                  Crear color
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Descripción</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {colors.map((color) => (
                      <tr key={color.id}>
                        <td>{color.description}</td>
                        <td>
                          <div className="flex justify-end gap-1">
                            <Link
                              href={`/apps/commerce/colors/${color.id}`}
                              className="btn btn-ghost btn-xs"
                              title="Editar"
                            >
                              <span className="iconify lucide--pencil size-4"></span>
                            </Link>
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              title="Eliminar"
                              onClick={() => setDeleteId(color.id)}
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
        title="Eliminar color"
        message="¿Estás seguro de que deseas eliminar este color?"
        itemName={colorToDelete?.description}
        loading={deleteLoading}
      />
    </>
  );
}
