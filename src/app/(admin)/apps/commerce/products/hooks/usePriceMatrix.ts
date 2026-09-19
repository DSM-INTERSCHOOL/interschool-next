import { useEffect, useRef, useState } from "react";
import { ProductPrice, ProductPriceInput } from "@/interfaces/IProduct";

interface PriceCell {
  sizeId?: number;
  colorId?: number;
  value: string;
  existingId?: number;
  originalValue?: string;
}

export interface PriceRow {
  key: string;
  sizeId?: number;
  colorId?: number;
  value: string;
  existingId?: number;
  originalValue?: string;
}

interface UsePriceMatrixArgs {
  sizeIds: number[];
  colorIds: number[];
  initialPrices?: ProductPrice[];
}

const cellKey = (sizeId?: number, colorId?: number): string => `${sizeId ?? "_"}:${colorId ?? "_"}`;

// Required cells: cross product when both dimensions are selected, one row
// per size/color when only one is, or a single flat row when neither is.
const computeRequiredCells = (
  sizeIds: number[],
  colorIds: number[]
): { sizeId?: number; colorId?: number }[] => {
  if (sizeIds.length === 0 && colorIds.length === 0) return [{}];
  if (colorIds.length === 0) return sizeIds.map((sizeId) => ({ sizeId }));
  if (sizeIds.length === 0) return colorIds.map((colorId) => ({ colorId }));
  const result: { sizeId?: number; colorId?: number }[] = [];
  for (const sizeId of sizeIds) {
    for (const colorId of colorIds) {
      result.push({ sizeId, colorId });
    }
  }
  return result;
};

/**
 * Owns the price-cell values for a SINGLE product's size×color matrix, and
 * builds the add/remove diff the backend expects (there is no in-place
 * "update this price's amount" operation -- see IProduct.ts's ProductUpdate).
 *
 * Cells for combinations that are no longer selected stay in `cells` (with
 * their typed value/existingId intact) instead of being deleted immediately,
 * so re-adding a combo restores what was there before; `buildDiff` is what
 * actually decides, at submit time, what's really been removed.
 */
export const usePriceMatrix = ({ sizeIds, colorIds, initialPrices }: UsePriceMatrixArgs) => {
  const [cells, setCells] = useState<Map<string, PriceCell>>(new Map());
  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current || !initialPrices || initialPrices.length === 0) return;
    seededRef.current = true;
    setCells((prev) => {
      const next = new Map(prev);
      for (const price of initialPrices) {
        const key = cellKey(price.size_id, price.color_id);
        next.set(key, {
          sizeId: price.size_id,
          colorId: price.color_id,
          value: String(price.price),
          existingId: price.id,
          originalValue: String(price.price),
        });
      }
      return next;
    });
  }, [initialPrices]);

  const requiredCells = computeRequiredCells(sizeIds, colorIds);
  const rows: PriceRow[] = requiredCells.map((cell) => {
    const key = cellKey(cell.sizeId, cell.colorId);
    const existing = cells.get(key);
    return {
      key,
      sizeId: cell.sizeId,
      colorId: cell.colorId,
      value: existing?.value ?? "",
      existingId: existing?.existingId,
      originalValue: existing?.originalValue,
    };
  });

  const setCellValue = (row: PriceRow, value: string) => {
    setCells((prev) => {
      const next = new Map(prev);
      next.set(row.key, {
        sizeId: row.sizeId,
        colorId: row.colorId,
        value,
        existingId: row.existingId,
        originalValue: row.originalValue,
      });
      return next;
    });
  };

  const isComplete = (): boolean =>
    rows.every((row) => row.value.trim() !== "" && !isNaN(Number(row.value)) && Number(row.value) >= 0);

  const buildDiff = (
    isEditMode: boolean
  ): { prices: ProductPriceInput[] } | { prices_to_add: ProductPriceInput[]; price_ids_to_remove: number[] } => {
    if (!isEditMode) {
      return {
        prices: rows
          .filter((row) => row.value !== "")
          .map((row) => ({ price: Number(row.value), size_id: row.sizeId, color_id: row.colorId })),
      };
    }

    const requiredKeys = new Set(rows.map((row) => row.key));
    const pricesToAdd: ProductPriceInput[] = [];
    const priceIdsToRemove: number[] = [];

    for (const row of rows) {
      if (row.existingId === undefined) {
        if (row.value !== "") {
          pricesToAdd.push({ price: Number(row.value), size_id: row.sizeId, color_id: row.colorId });
        }
      } else if (row.value !== row.originalValue) {
        // No in-place update: remove the old amount, add the new one.
        priceIdsToRemove.push(row.existingId);
        pricesToAdd.push({ price: Number(row.value), size_id: row.sizeId, color_id: row.colorId });
      }
    }

    // Existing prices whose size/color combo isn't selected anymore.
    for (const cell of cells.values()) {
      const key = cellKey(cell.sizeId, cell.colorId);
      if (cell.existingId !== undefined && !requiredKeys.has(key)) {
        priceIdsToRemove.push(cell.existingId);
      }
    }

    return { prices_to_add: pricesToAdd, price_ids_to_remove: priceIdsToRemove };
  };

  return { rows, setCellValue, isComplete, buildDiff };
};
