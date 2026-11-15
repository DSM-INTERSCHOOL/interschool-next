import { useCallback, useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { ProductAvailabilityRead, ProductRead } from "@/interfaces/IProduct";
import { getProductAvailability } from "@/services/order.service";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";

// Fetched once per catalog load, for every stock-tracked product -- a
// school's self-service/operator catalog is small enough that N parallel
// per-product calls up front is simpler than a dedicated batch endpoint,
// and it means every picker/cart interaction afterward is a local lookup
// with no extra round trip.
//
// orderMode, when given, lets the backend resolve the channel's configured
// default warehouse (CommerceConfig.self_service_warehouse_id /
// operator_warehouse_id) instead of falling back to the school's single
// exclusive for-sale warehouse -- otherwise this preview can show stock
// from the wrong warehouse when a school has set different ones per
// channel. Omitted (e.g. Devoluciones' new-article picker, which has no
// single channel) falls back to that same legacy single-warehouse lookup.
export const useProductAvailability = (products: ProductRead[], orderMode?: string) => {
  const [availabilityByProduct, setAvailabilityByProduct] = useState<Map<number, ProductAvailabilityRead>>(
    new Map()
  );

  const load = useCallback(() => {
    const trackedProducts = products.filter((p) => p.track_inventory);
    if (trackedProducts.length === 0) {
      setAvailabilityByProduct(new Map());
      return;
    }
    const { schoolId } = getOrgConfig();
    Promise.all(trackedProducts.map((p) => getProductAvailability({ schoolId, productId: p.id, orderMode })))
      .then((results) => {
        setAvailabilityByProduct(new Map(results.map((r) => [r.product_id, r])));
      })
      .catch(() => {
        // Non-critical: if availability can't be fetched, getAvailableQty
        // below falls back to "no cap" (same behavior as before this
        // feature existed) rather than blocking ordering entirely.
      });
  }, [products, orderMode]);

  useEffect(() => {
    load();
  }, [load]);

  // Reloaded on window focus too (see useRefetchOnFocus) -- stock entered
  // elsewhere (a new receiving, a count adjustment) should show up here
  // without the cashier/kiosk needing a hard refresh, even if `products`
  // itself hasn't changed.
  useRefetchOnFocus(load);

  // null = no cap to apply (not stock-tracked, or availability unknown --
  // e.g. still loading, or the fetch above failed).
  const getAvailableQty = (productId: number, colorId: number | null, sizeId: number | null): number | null => {
    const availability = availabilityByProduct.get(productId);
    if (!availability || !availability.track_inventory) return null;
    const variant = availability.variants.find((v) => v.color_id === colorId && v.size_id === sizeId);
    return variant ? variant.quantity : 0;
  };

  return { getAvailableQty };
};
