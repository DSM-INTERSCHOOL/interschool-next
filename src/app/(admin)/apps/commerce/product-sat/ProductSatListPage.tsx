"use client";

import { useState } from "react";
import { AppLink as Link } from "@/components/AppLink";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { useProductSats } from "./hooks";

export default function ProductSatListPage() {
  const { productSats, loading, error, removeProductSat } = useProductSats();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const itemToDelete = productSats.find((item) => item.id === deleteId) ?? null;

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      setDeleteLoading(true);
      await removeProductSat(deleteId);
      setDeleteId(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || "Error al eliminar el código SAT");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <PageTitle
        title="Códigos SAT"
        items={[{ label: "Apps" }, { label: "Comercio" }, { label: "Códigos SAT", active: true }]}
      />
      <div className="mt-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-2xl">
                <span className="iconify lucide--file-text size-6"></span>
                Catálogo de Códigos SAT
              </h2>
              <Link href="/apps/commerce/product-sat/create" className="btn btn-primary">
                <span className="iconify lucide--plus size-5"></span>
                Nuevo Código SAT
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner message="Cargando códigos SAT..." />
              </div>
            ) : error ? (
              <div className="alert alert-error">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>{error}</div>
              </div>
            ) : productSats.length === 0 ? (
              <div className="text-center py-16">
                <span className="iconify lucide--file-text size-24 text-base-content/20 mb-4"></span>
                <h3 className="text-xl font-medium text-base-content mb-2">No hay códigos SAT</h3>
                <p className="text-base-content/60 mb-6">Crea tu primer código SAT para comenzar</p>
                <Link href="/apps/commerce/product-sat/create" className="btn btn-primary btn-sm">
                  <span className="iconify lucide--plus size-4"></span>
                  Crear código SAT
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Clave</th>
                      <th>Descripción</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productSats.map((item) => (
                      <tr key={item.id}>
                        <td className="font-mono">{item.key}</td>
                        <td>{item.description}</td>
                        <td>
                          <div className="flex justify-end gap-1">
                            <Link
                              href={`/apps/commerce/product-sat/${item.id}`}
                              className="btn btn-ghost btn-xs"
                              title="Editar"
                            >
                              <span className="iconify lucide--pencil size-4"></span>
                            </Link>
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              title="Eliminar"
                              onClick={() => setDeleteId(item.id)}
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
        title="Eliminar código SAT"
        message="¿Estás seguro de que deseas eliminar este código SAT?"
        itemName={itemToDelete ? `${itemToDelete.key} - ${itemToDelete.description}` : null}
        loading={deleteLoading}
      />
    </>
  );
}
