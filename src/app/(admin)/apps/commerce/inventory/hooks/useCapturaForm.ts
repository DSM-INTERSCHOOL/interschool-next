import { useEffect, useMemo, useState } from "react";
import { useAppRouter as useRouter } from "@/hooks/useAppRouter";
import { getOrgConfig } from "@/lib/orgConfig";
import { CaptureLine } from "@/interfaces/IInventory";
import { createCaptura } from "@/services/inventory.service";
import { useMovementCatalogs } from "./useMovementCatalogs";
import { useTopCategories } from "./useTopCategories";

export interface CapturaRow {
  key: string;
  productId: number;
  productKey: string | null;
  productTitle: string;
  colorId: number | null;
  sizeId: number | null;
  current: number;
}

export const rowKey = (productId: number, colorId: number | null, sizeId: number | null) =>
  `${productId}:${colorId ?? ""}:${sizeId ?? ""}`;

// A physical count is a sweep through a whole category, not a one-by-one
// lookup -- so this doesn't build up a manually-added line list the way
// entrada/salida/transferencia do. Pick a warehouse + top-category and
// every stock-tracked product/variant in it shows up pre-filled with its
// current stock, ready to be corrected in place.
export const useCapturaForm = () => {
  const router = useRouter();
  const catalogs = useMovementCatalogs();
  const { topCategories, loading: topCategoriesLoading, error: topCategoriesError } = useTopCategories();

  const [warehouseId, setWarehouseId] = useState<number | "">("");
  const [topCategoryId, setTopCategoryId] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [counts, setCounts] = useState<Record<string, string>>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Previously typed counts stop making sense once the warehouse or
  // category changes -- the "current stock" they were corrections against
  // no longer applies.
  useEffect(() => {
    setCounts({});
  }, [warehouseId, topCategoryId]);

  const rows = useMemo<CapturaRow[]>(() => {
    if (warehouseId === "" || topCategoryId === "") return [];
    const result: CapturaRow[] = [];
    for (const product of catalogs.products) {
      if (!product.track_inventory) continue;
      if (product.top_category_id !== topCategoryId) continue;

      const variants: { colorId: number | null; sizeId: number | null }[] = [];
      if (product.color_ids.length > 0 && product.size_ids.length > 0) {
        for (const colorId of product.color_ids) {
          for (const sizeId of product.size_ids) variants.push({ colorId, sizeId });
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
          key: rowKey(product.id, colorId, sizeId),
          productId: product.id,
          productKey: product.product_key,
          productTitle: product.title,
          colorId,
          sizeId,
          current: inventory ? inventory.quantity : 0,
        });
      }
    }
    return result.sort((a, b) => a.productTitle.localeCompare(b.productTitle));
  }, [catalogs.products, catalogs.inventories, warehouseId, topCategoryId]);

  const countFor = (row: CapturaRow): string => counts[row.key] ?? String(row.current);
  const setCount = (key: string, value: string) => setCounts((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    try {
      setSaveError(null);

      if (warehouseId === "") {
        setSaveError("Selecciona un almacén");
        return;
      }
      if (topCategoryId === "") {
        setSaveError("Selecciona una categoría");
        return;
      }
      if (rows.length === 0) {
        setSaveError("No hay productos inventariables en esta categoría");
        return;
      }

      const lines: CaptureLine[] = [];
      for (const row of rows) {
        const value = countFor(row);
        if (value === "" || Number(value) < 0 || !Number.isFinite(Number(value))) {
          setSaveError(`Captura inválida para "${row.productTitle}"`);
          return;
        }
        lines.push({
          product_id: row.productId,
          color_id: row.colorId ?? undefined,
          size_id: row.sizeId ?? undefined,
          counted_quantity: Number(value),
        });
      }

      setSaveLoading(true);
      const { schoolId } = getOrgConfig();
      await createCaptura({
        schoolId,
        dto: { warehouse_id: Number(warehouseId), lines, notes: notes.trim() || undefined },
      });
      router.push("/apps/commerce/inventory");
    } catch (err: any) {
      setSaveError(err.response?.data?.detail || err.message || "Error al registrar la captura");
    } finally {
      setSaveLoading(false);
    }
  };

  return {
    catalogs,
    topCategories,
    topCategoriesLoading,
    topCategoriesError,
    warehouseId,
    setWarehouseId,
    topCategoryId,
    setTopCategoryId,
    notes,
    setNotes,
    rows,
    countFor,
    setCount,
    saveLoading,
    saveError,
    handleSave,
  };
};
