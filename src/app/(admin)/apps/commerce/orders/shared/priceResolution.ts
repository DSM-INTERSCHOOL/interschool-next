import { ProductRead } from "@/interfaces/IProduct";

// Same null-matching convention used throughout the inventory module's
// stock/cost lookups: a variant dimension the product doesn't use is
// matched against a null color_id/size_id, not skipped.
export const resolvePrice = (
  product: ProductRead,
  colorId: number | null,
  sizeId: number | null
): number | null => {
  const match = product.prices.find(
    (price) =>
      (colorId === null ? (price.color_id ?? null) === null : price.color_id === colorId) &&
      (sizeId === null ? (price.size_id ?? null) === null : price.size_id === sizeId)
  );
  return match ? Number(match.price) : null;
};

// The lowest priced variant, for the "desde $X" tile label when a product
// has multiple color/size combinations at different prices.
export const lowestPrice = (product: ProductRead): number | null => {
  if (product.prices.length === 0) return null;
  return Math.min(...product.prices.map((price) => Number(price.price)));
};
