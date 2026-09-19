"use client";

import { useState } from "react";
import { AppLink as Link } from "@/components/AppLink";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { buildCommerceUploadUrl } from "@/lib/commerceUploads";
import { useProducts } from "./hooks";

export default function ProductsListPage() {
  const { products, loading, error, typeFilter, setTypeFilter, statusFilter, setStatusFilter, removeProduct } =
    useProducts();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const productToDelete = products.find((product) => product.id === deleteId) ?? null;

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      setDeleteLoading(true);
      await removeProduct(deleteId);
      setDeleteId(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || err.message || "Error al eliminar el producto");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <PageTitle
        title="Productos"
        items={[{ label: "Apps" }, { label: "Comercio" }, { label: "Productos", active: true }]}
      />
      <div className="mt-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <h2 className="card-title text-2xl">
                <span className="iconify lucide--package size-6"></span>
                Catálogo de Productos
              </h2>
              <Link href="/apps/commerce/products/create" className="btn btn-primary">
                <span className="iconify lucide--plus size-5"></span>
                Nuevo Producto
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <select
                className="select select-bordered select-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
              >
                <option value="">Todos los tipos</option>
                <option value="SINGLE">Producto</option>
                <option value="KIT">Paquete</option>
              </select>
              <select
                className="select select-bordered select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="">Todos los estatus</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner message="Cargando productos..." />
              </div>
            ) : error ? (
              <div className="alert alert-error">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>{error}</div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <span className="iconify lucide--package size-24 text-base-content/20 mb-4"></span>
                <h3 className="text-xl font-medium text-base-content mb-2">No hay productos</h3>
                <p className="text-base-content/60 mb-6">Crea tu primer producto para comenzar</p>
                <Link href="/apps/commerce/products/create" className="btn btn-primary btn-sm">
                  <span className="iconify lucide--plus size-4"></span>
                  Crear producto
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Título</th>
                      <th>Tipo</th>
                      <th>Estatus</th>
                      <th>Descuento</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          {product.thumbnail ? (
                            <img
                              src={buildCommerceUploadUrl(product.thumbnail)}
                              alt=""
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-base-200 flex items-center justify-center">
                              <span className="iconify lucide--image-off size-5 text-base-content/30"></span>
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="font-medium">{product.title}</div>
                          <div className="text-sm text-base-content/60 truncate max-w-xs">
                            {product.description}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${product.type === "KIT" ? "badge-secondary" : "badge-ghost"}`}>
                            {product.type === "KIT" ? "Paquete" : "Producto"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${product.status === "ACTIVO" ? "badge-success" : "badge-neutral"}`}
                          >
                            {product.status === "ACTIVO" ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td>{product.discount}%</td>
                        <td>
                          <div className="flex justify-end gap-1">
                            <Link
                              href={`/apps/commerce/products/${product.id}`}
                              className="btn btn-ghost btn-xs"
                              title="Editar"
                            >
                              <span className="iconify lucide--pencil size-4"></span>
                            </Link>
                            <button
                              className="btn btn-ghost btn-xs text-error"
                              title="Eliminar"
                              onClick={() => setDeleteId(product.id)}
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
        title="Eliminar producto"
        message="¿Estás seguro de que deseas eliminar este producto?"
        itemName={productToDelete?.title}
        loading={deleteLoading}
      />
    </>
  );
}
