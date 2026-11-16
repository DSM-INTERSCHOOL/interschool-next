"use client";

import { useEffect, useRef } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ProductRead } from "@/interfaces/IProduct";
import { ColorRead } from "@/interfaces/IColor";
import { SizeRead } from "@/interfaces/ISize";
import { InventoryRead } from "@/interfaces/IInventory";
import { ProductSearchSelect } from "../../components";
import { MovementLine, useLastCost } from "../hooks";

export interface StockWarehouse {
  label: string;
  warehouseId: number | "";
}

interface MovementLineItemsEditorProps {
  lines: MovementLine[];
  products: ProductRead[];
  colors: ColorRead[];
  sizes: SizeRead[];
  inventories: InventoryRead[];
  stockWarehouses: StockWarehouse[];
  loading: boolean;
  // Salida/Transferencia only: entrada is where a *new* cost gets
  // established, so surfacing the previous one there would be misleading;
  // for outgoing movements it's a genuinely useful default.
  showLastCost?: boolean;
  onAddLine: () => void;
  onRemoveLine: (index: number) => void;
  onUpdateLine: (index: number, field: keyof MovementLine, value: string) => void;
}

// null means "no inventory row for this exact product/warehouse/color/size
// combination", which is a valid, meaningful state (this variant has never
// been stocked there) -- always rendered as "0", not left blank, so it
// reads as a real answer rather than a still-loading placeholder.
const findStock = (
  inventories: InventoryRead[],
  productId: number | "",
  warehouseId: number | "",
  colorId: number | "",
  sizeId: number | ""
): number | null => {
  if (productId === "" || warehouseId === "") return null;
  const row = inventories.find(
    (inventory) =>
      String(inventory.product_id) === String(productId) &&
      String(inventory.warehouse_id) === String(warehouseId) &&
      (colorId === "" ? inventory.color_id === null : String(inventory.color_id) === String(colorId)) &&
      (sizeId === "" ? inventory.size_id === null : String(inventory.size_id) === String(sizeId))
  );
  return row ? row.quantity : 0;
};

export function MovementLineItemsEditor({
  lines,
  products,
  colors,
  sizes,
  inventories,
  stockWarehouses,
  loading,
  showLastCost = false,
  onAddLine,
  onRemoveLine,
  onUpdateLine,
}: MovementLineItemsEditorProps) {
  const lastCost = useLastCost();
  // Tracks, per line index, the product/color/size combo we already
  // auto-filled the cost for -- so we apply the last cost once per
  // selection change and then leave the field alone if the user edits it
  // by hand (re-running on every render, since findLastCost's result only
  // becomes available once the async history fetch resolves).
  const autoFilledKeyRef = useRef<Map<number, string>>(new Map());

  useEffect(() => {
    if (!showLastCost) return;
    for (const line of lines) {
      if (line.product_id !== "") lastCost.ensureHistory(Number(line.product_id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLastCost, lines.map((line) => line.product_id).join(",")]);

  useEffect(() => {
    if (!showLastCost) return;
    lines.forEach((line, index) => {
      const key = `${line.product_id}:${line.color_id}:${line.size_id}`;
      if (autoFilledKeyRef.current.get(index) === key) return;
      const last = lastCost.findLastCost(line.product_id, line.color_id, line.size_id);
      if (last === null) return;
      autoFilledKeyRef.current.set(index, key);
      onUpdateLine(index, "costo", String(last));
    });
  });

  if (loading) {
    return <LoadingSpinner size="sm" message="Cargando catálogos..." />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th className="min-w-[260px]">Producto</th>
              <th>Color</th>
              <th>Talla</th>
              <th className="w-28">Cantidad</th>
              <th className="w-32">Costo</th>
              <th className="min-w-[140px]">Stock actual</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <tr key={index}>
                <td>
                  <ProductSearchSelect
                    products={products}
                    value={line.product_id}
                    onChange={(productId) => onUpdateLine(index, "product_id", productId.toString())}
                  />
                </td>
                <td>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={line.color_id}
                    onChange={(e) => onUpdateLine(index, "color_id", e.target.value)}
                  >
                    <option value="">—</option>
                    {colors.map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.description}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={line.size_id}
                    onChange={(e) => onUpdateLine(index, "size_id", e.target.value)}
                  >
                    <option value="">—</option>
                    {sizes.map((size) => (
                      <option key={size.id} value={size.id}>
                        {size.description}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="number"
                    min={1}
                    className="input input-bordered input-sm w-full"
                    value={line.quantity}
                    onChange={(e) => onUpdateLine(index, "quantity", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="input input-bordered input-sm w-full"
                    placeholder="$0.00"
                    value={line.costo}
                    onChange={(e) => onUpdateLine(index, "costo", e.target.value)}
                  />
                </td>
                <td>
                  <div className="flex flex-col gap-1">
                    {stockWarehouses.map((warehouse) => {
                      const stock = findStock(
                        inventories,
                        line.product_id,
                        warehouse.warehouseId,
                        line.color_id,
                        line.size_id
                      );
                      return (
                        <div key={warehouse.label} className="flex items-center gap-1 text-xs">
                          {stockWarehouses.length > 1 && (
                            <span className="text-base-content/60">{warehouse.label}:</span>
                          )}
                          {stock === null ? (
                            <span className="text-base-content/40">—</span>
                          ) : (
                            <span className={`badge badge-sm ${stock > 0 ? "badge-ghost" : "badge-warning"}`}>
                              {stock}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => onRemoveLine(index)}
                    disabled={lines.length === 1}
                    title="Quitar línea"
                  >
                    <span className="iconify lucide--trash-2 size-4"></span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="btn btn-outline btn-sm w-fit" onClick={onAddLine}>
        <span className="iconify lucide--plus size-4"></span>
        Agregar línea
      </button>
    </div>
  );
}
