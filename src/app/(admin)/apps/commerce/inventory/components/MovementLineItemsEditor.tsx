"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ProductRead } from "@/interfaces/IProduct";
import { ColorRead } from "@/interfaces/IColor";
import { SizeRead } from "@/interfaces/ISize";
import { MovementLine } from "../hooks";

interface MovementLineItemsEditorProps {
  lines: MovementLine[];
  products: ProductRead[];
  colors: ColorRead[];
  sizes: SizeRead[];
  loading: boolean;
  onAddLine: () => void;
  onRemoveLine: (index: number) => void;
  onUpdateLine: (index: number, field: keyof MovementLine, value: string) => void;
}

export function MovementLineItemsEditor({
  lines,
  products,
  colors,
  sizes,
  loading,
  onAddLine,
  onRemoveLine,
  onUpdateLine,
}: MovementLineItemsEditorProps) {
  if (loading) {
    return <LoadingSpinner size="sm" message="Cargando catálogos..." />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th className="min-w-[220px]">Producto</th>
              <th>Color</th>
              <th>Talla</th>
              <th className="w-28">Cantidad</th>
              <th className="w-32">Costo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <tr key={index}>
                <td>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={line.product_id}
                    onChange={(e) => onUpdateLine(index, "product_id", e.target.value)}
                  >
                    <option value="">Selecciona un producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.title}
                      </option>
                    ))}
                  </select>
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
