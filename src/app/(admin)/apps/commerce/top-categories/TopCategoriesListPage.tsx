"use client";

import { useState } from "react";
import { AppLink as Link } from "@/components/AppLink";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { useTopCategories } from "./hooks";

export default function TopCategoriesListPage() {
  const { topCategories, loading, error, removeTopCategory } = useTopCategories();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const topCategoryToDelete = topCategories.find((topCategory) => topCategory.id === deleteId) ?? null;

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      setDeleteLoading(true);
      await removeTopCategory(deleteId);
      setDeleteId(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || "Error al eliminar la categoría");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <PageTitle
        title="Categorías"
      />
      <div className="mt-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex flex-wrap justify-end items-center gap-2 mb-4">
              <div className="flex gap-2">
                <Link href="/apps/commerce/top-categories/order-modes" className="btn btn-outline">
                  <span className="iconify lucide--toggle-right size-5"></span>
                  Modos de Venta
                </Link>
                <Link href="/apps/commerce/top-categories/create" className="btn btn-primary">
                  <span className="iconify lucide--plus size-5"></span>
                  Nueva Categoría
                </Link>
              </div>
            </div>

            <p className="text-base-content/60 text-sm mb-4">
              Agrupación de alto nivel para los productos (Ej. Alimentos y Bebidas, Uniformes, Útiles). A
              diferencia de los clasificadores, cada producto pertenece a una sola categoría.
            </p>

            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner message="Cargando categorías..." />
              </div>
            ) : error ? (
              <div className="alert alert-error">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>{error}</div>
              </div>
            ) : topCategories.length === 0 ? (
              <div className="text-center py-16">
                <span className="iconify lucide--layout-grid size-24 text-base-content/20 mb-4"></span>
                <h3 className="text-xl font-medium text-base-content mb-2">No hay categorías</h3>
                <p className="text-base-content/60 mb-6">Crea tu primera categoría para comenzar</p>
                <Link href="/apps/commerce/top-categories/create" className="btn btn-primary btn-sm">
                  <span className="iconify lucide--plus size-4"></span>
                  Crear categoría
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
                    {topCategories.map((topCategory) => (
                      <tr key={topCategory.id}>
                        <td>{topCategory.description}</td>
                        <td>
                          <div className="flex justify-end gap-1">
                            <Link
                              href={`/apps/commerce/top-categories/${topCategory.id}`}
                              className="btn btn-ghost btn-xs"
                              title="Editar"
                            >
                              <span className="iconify lucide--pencil size-4"></span>
                            </Link>
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              title="Eliminar"
                              onClick={() => setDeleteId(topCategory.id)}
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
        title="Eliminar categoría"
        message="¿Estás seguro de que deseas eliminar esta categoría?"
        itemName={topCategoryToDelete?.description}
        loading={deleteLoading}
      />
    </>
  );
}
