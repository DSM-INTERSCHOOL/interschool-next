"use client";

import { useState } from "react";
import { AppLink as Link } from "@/components/AppLink";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { useWarehouses } from "./hooks";

export default function WarehousesListPage() {
  const { warehouses, loading, error, actionLoading, removeWarehouse, markForSale } = useWarehouses();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const warehouseToDelete = warehouses.find((warehouse) => warehouse.id === deleteId) ?? null;

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      setDeleteLoading(true);
      await removeWarehouse(deleteId);
      setDeleteId(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || "Error al eliminar el almacén");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <PageTitle
        title="Almacenes"
        items={[{ label: "Apps" }, { label: "Comercio" }, { label: "Almacenes", active: true }]}
      />
      <div className="mt-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-2xl">
                <span className="iconify lucide--warehouse size-6"></span>
                Catálogo de Almacenes
              </h2>
              <Link href="/apps/commerce/warehouses/create" className="btn btn-primary">
                <span className="iconify lucide--plus size-5"></span>
                Nuevo Almacén
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner message="Cargando almacenes..." />
              </div>
            ) : error ? (
              <div className="alert alert-error">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>{error}</div>
              </div>
            ) : warehouses.length === 0 ? (
              <div className="text-center py-16">
                <span className="iconify lucide--warehouse size-24 text-base-content/20 mb-4"></span>
                <h3 className="text-xl font-medium text-base-content mb-2">No hay almacenes</h3>
                <p className="text-base-content/60 mb-6">Crea tu primer almacén para comenzar</p>
                <Link href="/apps/commerce/warehouses/create" className="btn btn-primary btn-sm">
                  <span className="iconify lucide--plus size-4"></span>
                  Crear almacén
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Descripción</th>
                      <th className="text-center">Almacén de venta</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warehouses.map((warehouse) => (
                      <tr key={warehouse.id}>
                        <td>{warehouse.description}</td>
                        <td className="text-center">
                          {warehouse.for_sale ? (
                            <span className="badge badge-success">Sí</span>
                          ) : (
                            <button
                              className="btn btn-outline btn-xs"
                              disabled={actionLoading === warehouse.id}
                              onClick={() => markForSale(warehouse.id)}
                            >
                              {actionLoading === warehouse.id ? (
                                <span className="loading loading-spinner loading-xs"></span>
                              ) : (
                                "Marcar como almacén de venta"
                              )}
                            </button>
                          )}
                        </td>
                        <td>
                          <div className="flex justify-end gap-1">
                            <Link
                              href={`/apps/commerce/warehouses/${warehouse.id}`}
                              className="btn btn-ghost btn-xs"
                              title="Editar"
                            >
                              <span className="iconify lucide--pencil size-4"></span>
                            </Link>
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              title="Eliminar"
                              onClick={() => setDeleteId(warehouse.id)}
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
        title="Eliminar almacén"
        message="¿Estás seguro de que deseas eliminar este almacén?"
        itemName={warehouseToDelete?.description}
        loading={deleteLoading}
      />
    </>
  );
}
