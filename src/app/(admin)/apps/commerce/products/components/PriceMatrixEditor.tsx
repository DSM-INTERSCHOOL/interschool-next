"use client";

import { ColorRead } from "@/interfaces/IColor";
import { SizeRead } from "@/interfaces/ISize";
import { PriceRow } from "../hooks";

interface PriceMatrixEditorProps {
  rows: PriceRow[];
  onChange: (row: PriceRow, value: string) => void;
  colors: ColorRead[];
  sizes: SizeRead[];
}

// Renders as a real size×color grid when both dimensions are selected, a
// simple one-per-size/color list when only one is, or a single flat input
// when neither is -- driven entirely by usePriceMatrix's `rows`.
export function PriceMatrixEditor({ rows, onChange, colors, sizes }: PriceMatrixEditorProps) {
  if (rows.length === 0) return null;

  const sizeLabel = (id?: number) => sizes.find((size) => size.id === id)?.description ?? "";
  const colorLabel = (id?: number) => colors.find((color) => color.id === id)?.description ?? "";

  const hasSizes = rows.some((row) => row.sizeId !== undefined);
  const hasColors = rows.some((row) => row.colorId !== undefined);

  if (hasSizes && hasColors) {
    const sizeIds = Array.from(new Set(rows.map((row) => row.sizeId!)));
    const colorIds = Array.from(new Set(rows.map((row) => row.colorId!)));
    return (
      <div>
        <label className="label">
          <span className="label-text">Precios por talla y color</span>
        </label>
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th></th>
                {colorIds.map((colorId) => (
                  <th key={colorId}>{colorLabel(colorId)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizeIds.map((sizeId) => (
                <tr key={sizeId}>
                  <th>{sizeLabel(sizeId)}</th>
                  {colorIds.map((colorId) => {
                    const row = rows.find((r) => r.sizeId === sizeId && r.colorId === colorId);
                    if (!row) return <td key={colorId} />;
                    return (
                      <td key={colorId}>
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          className="input input-bordered input-sm w-28"
                          value={row.value}
                          onChange={(e) => onChange(row, e.target.value)}
                          placeholder="$0.00"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="label">
        <span className="label-text">Precios</span>
      </label>
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center gap-3">
            <span className="w-32 text-sm">
              {hasSizes ? sizeLabel(row.sizeId) : hasColors ? colorLabel(row.colorId) : "Precio único"}
            </span>
            <input
              type="number"
              step="0.01"
              min={0}
              className="input input-bordered input-sm w-32"
              value={row.value}
              onChange={(e) => onChange(row, e.target.value)}
              placeholder="$0.00"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
