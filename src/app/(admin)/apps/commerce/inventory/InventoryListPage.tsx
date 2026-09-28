"use client";

import { AppLink as Link } from "@/components/AppLink";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useInventoryList, useMovementCatalogs } from "./hooks";

export default function InventoryListPage() {
  const { inventories, loading, error } = useInventoryList();
  const catalogs = useMovementCatalogs();

  const productTitle = (id: number) => catalogs.products.find((p) => p.id === id)?.title ?? `#${id}`;
  const warehouseDescription = (id: number) =>
    catalogs.warehouses.find((w) => w.id === id)?.description ?? `#${id}`;
  const colorDescription = (id: number | null) =>
    id === null ? "—" : catalogs.colors.find((c) => c.id === id)?.description ?? `#${id}`;
  const sizeDescription = (id: number | null) =>
    id === null ? "—" : catalogs.sizes.find((s) => s.id === id)?.description ?? `#${id}`;

  return (
    <>
      <PageTitle
        title="Inventario"
        items={[{ label: "Apps" }, { label: "Comercio" }, { label: "Inventario", active: true }]}
      />
      <div className="mt-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <h2 className="card-title text-2xl">
                <span className="iconify lucide--boxes size-6"></span>
                Existencias
              </h2>
              <div className="flex flex-wrap gap-2">
                <Link href="/apps/commerce/inventory/entrada" className="btn btn-primary btn-sm">
                  <span className="iconify lucide--arrow-down-to-line size-4"></span>
                  Entrada
                </Link>
                <Link href="/apps/commerce/inventory/salida" className="btn btn-secondary btn-sm">
                  <span className="iconify lucide--arrow-up-from-line size-4"></span>
                  Salida
                </Link>
                <Link href="/apps/commerce/inventory/transferencia" className="btn btn-outline btn-sm">
                  <span className="iconify lucide--arrow-left-right size-4"></span>
                  Transferencia
                </Link>
              </div>
            </div>

            {loading || catalogs.loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner message="Cargando inventario..." />
              </div>
            ) : error || catalogs.error ? (
              <div className="alert alert-error">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>{error || catalogs.error}</div>
              </div>
            ) : inventories.length === 0 ? (
              <div className="text-center py-16">
                <span className="iconify lucide--boxes size-24 text-base-content/20 mb-4"></span>
                <h3 className="text-xl font-medium text-base-content mb-2">Sin existencias registradas</h3>
                <p className="text-base-content/60 mb-6">Registra una entrada para comenzar a controlar el inventario</p>
                <Link href="/apps/commerce/inventory/entrada" className="btn btn-primary btn-sm">
                  <span className="iconify lucide--arrow-down-to-line size-4"></span>
                  Registrar entrada
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Almacén</th>
                      <th>Color</th>
                      <th>Talla</th>
                      <th className="text-right">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventories.map((inventory) => (
                      <tr key={inventory.id}>
                        <td>{productTitle(inventory.product_id)}</td>
                        <td>{warehouseDescription(inventory.warehouse_id)}</td>
                        <td>{colorDescription(inventory.color_id)}</td>
                        <td>{sizeDescription(inventory.size_id)}</td>
                        <td className="text-right font-medium">{inventory.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
