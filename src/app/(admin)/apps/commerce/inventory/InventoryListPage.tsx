"use client";

import { useEffect, useMemo, useState } from "react";
import { AppLink as Link } from "@/components/AppLink";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PrintButton, PrintSection } from "@/components/PrintSection";
import { useMovementCatalogs } from "./hooks";

interface StockRow {
  productId: number;
  productKey: string | null;
  productTitle: string;
  colorId: number | null;
  sizeId: number | null;
  quantity: number;
}

export default function InventoryListPage() {
  const catalogs = useMovementCatalogs();
  const [warehouseId, setWarehouseId] = useState<number | "">("");

  // Default to the first warehouse once the catalogs load, so the page
  // shows something useful without an extra click.
  useEffect(() => {
    if (warehouseId === "" && catalogs.warehouses.length > 0) {
      setWarehouseId(catalogs.warehouses[0].id);
    }
  }, [catalogs.warehouses, warehouseId]);

  const colorDescription = (id: number | null) =>
    id === null ? "—" : catalogs.colors.find((c) => c.id === id)?.description ?? `#${id}`;
  const sizeDescription = (id: number | null) =>
    id === null ? "—" : catalogs.sizes.find((s) => s.id === id)?.description ?? `#${id}`;

  // Every inventariable product's variants, derived the same way the price
  // matrix derives its required cells: the cross product of the product's
  // own selected colors x sizes (falling back to one dimension, or a single
  // flat variant when neither is set) -- not product.prices, which can be
  // incomplete for products that predate pricing or were seeded outside the
  // form. Cross-referenced against the selected warehouse's inventory rows;
  // a variant with no matching row genuinely has never been stocked there,
  // so it reads as 0 rather than being left out of the list.
  const rows = useMemo<StockRow[]>(() => {
    if (warehouseId === "") return [];
    const result: StockRow[] = [];
    for (const product of catalogs.products) {
      if (!product.track_inventory) continue;
      const variants: { colorId: number | null; sizeId: number | null }[] = [];
      if (product.color_ids.length > 0 && product.size_ids.length > 0) {
        for (const colorId of product.color_ids) {
          for (const sizeId of product.size_ids) {
            variants.push({ colorId, sizeId });
          }
        }
      } else if (product.color_ids.length > 0) {
        for (const colorId of product.color_ids) variants.push({ colorId, sizeId: null });
      } else if (product.size_ids.length > 0) {
        for (const sizeId of product.size_ids) variants.push({ colorId: null, sizeId });
      } else {
        variants.push({ colorId: null, sizeId: null });
      }
      for (const { colorId, sizeId } of variants) {
        const inventory = catalogs.inventories.find(
          (inv) =>
            inv.product_id === product.id &&
            inv.warehouse_id === warehouseId &&
            inv.color_id === colorId &&
            inv.size_id === sizeId
        );
        result.push({
          productId: product.id,
          productKey: product.product_key,
          productTitle: product.title,
          colorId,
          sizeId,
          quantity: inventory ? inventory.quantity : 0,
        });
      }
    }
    return result.sort((a, b) => a.productTitle.localeCompare(b.productTitle));
  }, [catalogs.products, catalogs.inventories, warehouseId]);

  const loading = catalogs.loading;
  const error = catalogs.error;

  return (
    <>
      <PageTitle
        title="Inventario"
      />
      <div className="mt-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex flex-wrap justify-end items-center gap-4 mb-4">
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
                <Link href="/apps/commerce/inventory/captura" className="btn btn-outline btn-sm">
                  <span className="iconify lucide--clipboard-list size-4"></span>
                  Captura
                </Link>
                <Link href="/apps/commerce/inventory/producto-kardex" className="btn btn-ghost btn-sm">
                  <span className="iconify lucide--history size-4"></span>
                  Producto Kardex
                </Link>
                <Link href="/apps/commerce/inventory/kardex-almacen" className="btn btn-ghost btn-sm">
                  <span className="iconify lucide--warehouse size-4"></span>
                  Kardex de Almacén
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner message="Cargando inventario..." />
              </div>
            ) : error ? (
              <div className="alert alert-error">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>{error}</div>
              </div>
            ) : catalogs.warehouses.length === 0 ? (
              <div className="text-center py-16">
                <span className="iconify lucide--warehouse size-24 text-base-content/20 mb-4"></span>
                <h3 className="text-xl font-medium text-base-content mb-2">Sin almacenes registrados</h3>
                <p className="text-base-content/60">Registra un almacén para poder controlar existencias</p>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex flex-wrap gap-2">
                    {catalogs.warehouses.map((warehouse) => (
                      <button
                        key={warehouse.id}
                        type="button"
                        className={`btn btn-sm ${warehouseId === warehouse.id ? "btn-primary" : "btn-outline"}`}
                        onClick={() => setWarehouseId(warehouse.id)}
                      >
                        {warehouse.description}
                      </button>
                    ))}
                  </div>
                  <PrintButton title="Inventario" disabled={rows.length === 0} />
                </div>

                {rows.length === 0 ? (
                  <div className="text-center py-16">
                    <span className="iconify lucide--boxes size-24 text-base-content/20 mb-4"></span>
                    <h3 className="text-xl font-medium text-base-content mb-2">Sin productos inventariables</h3>
                    <p className="text-base-content/60">
                      Marca al menos un producto como &quot;se vende contra inventarios&quot; para verlo aquí
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Clave</th>
                          <th>Producto</th>
                          <th>Color</th>
                          <th>Talla</th>
                          <th className="text-right">Existencia</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => {
                          const movementsHref =
                            `/apps/commerce/inventory/producto-kardex?product_id=${row.productId}` +
                            `&warehouse_id=${warehouseId}` +
                            (row.colorId !== null ? `&color_id=${row.colorId}` : "") +
                            (row.sizeId !== null ? `&size_id=${row.sizeId}` : "");
                          return (
                            <tr key={`${row.productId}:${row.colorId}:${row.sizeId}`}>
                              <td>{row.productKey ?? "—"}</td>
                              <td>{row.productTitle}</td>
                              <td>{colorDescription(row.colorId)}</td>
                              <td>{sizeDescription(row.sizeId)}</td>
                              <td className="text-right font-medium">
                                <span className={`badge ${row.quantity > 0 ? "badge-ghost" : "badge-warning"}`}>
                                  {row.quantity}
                                </span>
                              </td>
                              <td>
                                <Link href={movementsHref} className="btn btn-ghost btn-xs" title="Ver producto kardex">
                                  <span className="iconify lucide--history size-4"></span>
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {rows.length > 0 && (
        <PrintSection
          title="Inventario"
          meta={
            warehouseId !== ""
              ? [{ label: "Almacén", value: catalogs.warehouses.find((w) => w.id === warehouseId)?.description ?? "" }]
              : []
          }
        >
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Clave</th>
                <th>Producto</th>
                <th>Color</th>
                <th>Talla</th>
                <th className="text-right">Existencia</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.productId}:${row.colorId}:${row.sizeId}`}>
                  <td>{row.productKey ?? "—"}</td>
                  <td>{row.productTitle}</td>
                  <td>{colorDescription(row.colorId)}</td>
                  <td>{sizeDescription(row.sizeId)}</td>
                  <td className="text-right font-medium">{row.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PrintSection>
      )}
    </>
  );
}
