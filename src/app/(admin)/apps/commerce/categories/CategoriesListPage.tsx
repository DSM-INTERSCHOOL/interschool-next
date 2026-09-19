"use client";

import { useState } from "react";
import { AppLink as Link } from "@/components/AppLink";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { useCategories } from "./hooks";

export default function CategoriesListPage() {
  const { categories, loading, error, removeCategory } = useCategories();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const categoryToDelete = categories.find((category) => category.id === deleteId) ?? null;

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      setDeleteLoading(true);
      await removeCategory(deleteId);
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
        items={[{ label: "Apps" }, { label: "Comercio" }, { label: "Categorías", active: true }]}
      />
      <div className="mt-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-2xl">
                <span className="iconify lucide--tag size-6"></span>
                Catálogo de Categorías
              </h2>
              <Link href="/apps/commerce/categories/create" className="btn btn-primary">
                <span className="iconify lucide--plus size-5"></span>
                Nueva Categoría
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner message="Cargando categorías..." />
              </div>
            ) : error ? (
              <div className="alert alert-error">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>{error}</div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-16">
                <span className="iconify lucide--tag size-24 text-base-content/20 mb-4"></span>
                <h3 className="text-xl font-medium text-base-content mb-2">No hay categorías</h3>
                <p className="text-base-content/60 mb-6">Crea tu primera categoría para comenzar</p>
                <Link href="/apps/commerce/categories/create" className="btn btn-primary btn-sm">
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
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td>{category.description}</td>
                        <td>
                          <div className="flex justify-end gap-1">
                            <Link
                              href={`/apps/commerce/categories/${category.id}`}
                              className="btn btn-ghost btn-xs"
                              title="Editar"
                            >
                              <span className="iconify lucide--pencil size-4"></span>
                            </Link>
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              title="Eliminar"
                              onClick={() => setDeleteId(category.id)}
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
        itemName={categoryToDelete?.description}
        loading={deleteLoading}
      />
    </>
  );
}
