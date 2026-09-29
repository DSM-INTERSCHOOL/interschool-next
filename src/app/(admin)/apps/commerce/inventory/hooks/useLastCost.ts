import { useRef, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { ProductKardexRead } from "@/interfaces/IInventory";
import { getProductKardexHistory } from "@/services/inventory.service";

// product_kardex grows unboundedly (every sale/entrada/salida/transferencia
// leg adds a row), so unlike the small catalog lists in useMovementCatalogs,
// this is never fetched in full upfront -- only on demand, per product,
// cached here so re-selecting the same product across lines (or switching
// back to it) doesn't refetch.
export const useLastCost = () => {
  const [historyByProduct, setHistoryByProduct] = useState<Map<number, ProductKardexRead[]>>(new Map());
  const fetchingRef = useRef<Set<number>>(new Set());

  const ensureHistory = (productId: number) => {
    if (historyByProduct.has(productId) || fetchingRef.current.has(productId)) return;
    fetchingRef.current.add(productId);
    const { schoolId } = getOrgConfig();
    getProductKardexHistory({ schoolId, productId })
      .then((history) => {
        setHistoryByProduct((prev) => new Map(prev).set(productId, history));
      })
      .catch(() => {
        // Cache an empty result so a persistent error doesn't retry forever.
        setHistoryByProduct((prev) => new Map(prev).set(productId, []));
      })
      .finally(() => {
        fetchingRef.current.delete(productId);
      });
  };

  // History is already most-recent-first (backend orders product-kardex by
  // id desc); find the first line matching this exact color/size (color_id/
  // size_id null-matched the same way stock lookup does) that actually has
  // a costo recorded.
  const findLastCost = (
    productId: number | "",
    colorId: number | "",
    sizeId: number | ""
  ): number | null => {
    if (productId === "") return null;
    const history = historyByProduct.get(Number(productId));
    if (!history) return null;
    const match = history.find(
      (line) =>
        (colorId === "" ? line.color_id === null : String(line.color_id) === String(colorId)) &&
        (sizeId === "" ? line.size_id === null : String(line.size_id) === String(sizeId)) &&
        line.costo !== null
    );
    return match ? match.costo : null;
  };

  return { ensureHistory, findLastCost };
};
