import { useEffect, useMemo, useState } from "react";
import { ProductRead } from "@/interfaces/IProduct";
import { ColorRead } from "@/interfaces/IColor";
import { SizeRead } from "@/interfaces/ISize";
import { buildCommerceUploadUrl } from "@/lib/commerceUploads";
import { resolvePrice } from "../priceResolution";
import { CartLine, cartLineKey } from "../hooks";

interface ProductPickerModalProps {
  product: ProductRead;
  colors: ColorRead[];
  sizes: SizeRead[];
  onClose: () => void;
  onAdd: (line: Omit<CartLine, "quantity">, quantity: number) => void;
  // null = not stock-tracked (no cap). Already nets out what's in the cart
  // for this exact variant -- this is "how many MORE can be added right
  // now", not the variant's raw stock.
  getRemainingStock: (productId: number, colorId: number | null, sizeId: number | null) => number | null;
}

export function ProductPickerModal({
  product,
  colors,
  sizes,
  onClose,
  onAdd,
  getRemainingStock,
}: ProductPickerModalProps) {
  const colorOptions = useMemo(
    () => colors.filter((color) => product.color_ids.includes(color.id)),
    [colors, product.color_ids]
  );
  const sizeOptions = useMemo(
    () => sizes.filter((size) => product.size_ids.includes(size.id)),
    [sizes, product.size_ids]
  );

  const [colorId, setColorId] = useState<number | null>(colorOptions.length === 1 ? colorOptions[0].id : null);
  const [sizeId, setSizeId] = useState<number | null>(sizeOptions.length === 1 ? sizeOptions[0].id : null);
  const [quantity, setQuantity] = useState(1);

  // The thumbnail (if any) always leads the carousel -- it's the picture
  // chosen to represent this product, so it should be what the customer
  // sees first, not whatever order the pictures happened to upload in.
  const images = useMemo(() => {
    const paths = product.pictures.map((p) => p.path);
    if (product.thumbnail) {
      const idx = paths.indexOf(product.thumbnail);
      if (idx > 0) paths.splice(idx, 1);
      if (idx !== 0) paths.unshift(product.thumbnail);
    }
    return paths;
  }, [product.pictures, product.thumbnail]);
  const [imageIndex, setImageIndex] = useState(0);
  const currentImage = images[imageIndex] ?? null;
  const prevImage = () => setImageIndex((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setImageIndex((i) => (i + 1) % images.length);

  const needsColor = colorOptions.length > 0;
  const needsSize = sizeOptions.length > 0;
  const unitPrice = resolvePrice(product, colorId, sizeId);
  const variantChosen = (!needsColor || colorId !== null) && (!needsSize || sizeId !== null);

  // null while the variant isn't fully chosen yet (nothing to check against);
  // once it is, null means "no cap" (not stock-tracked).
  const remainingStock = variantChosen ? getRemainingStock(product.id, colorId, sizeId) : null;
  const outOfStock = remainingStock !== null && remainingStock <= 0;

  // Selection changed to a variant with less room than the quantity
  // already dialed in -- pull it back down rather than letting a stale,
  // too-high quantity sit there ready to submit.
  useEffect(() => {
    if (remainingStock !== null && quantity > remainingStock) {
      setQuantity(Math.max(1, remainingStock));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingStock]);

  const ready = variantChosen && unitPrice !== null && !outOfStock;

  const handleAdd = () => {
    if (!ready || unitPrice === null) return;
    const colorLabel = colorOptions.find((c) => c.id === colorId)?.description ?? null;
    const sizeLabel = sizeOptions.find((s) => s.id === sizeId)?.description ?? null;
    onAdd(
      {
        key: cartLineKey(product.id, colorId, sizeId),
        productId: product.id,
        title: product.title,
        thumbnail: product.thumbnail,
        colorId,
        colorLabel,
        sizeId,
        sizeLabel,
        unitPrice,
      },
      quantity
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl bg-base-100 shadow-2xl sm:max-w-sm sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full shrink-0 pt-3">
          {/* Square, not full-width -- most product photos are square (see
              recommended format), and letting this box stay full-width
              with object-contain just leaves large empty margins on the
              sides for anything that isn't already as wide as the modal. */}
          <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-2xl bg-base-200 sm:h-48 sm:w-48">
            {currentImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={buildCommerceUploadUrl(currentImage)}
                alt=""
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="iconify lucide--image-off size-16 text-base-content/30"></span>
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="btn btn-circle btn-xs absolute left-1 top-1/2 -translate-y-1/2 bg-base-100/80"
                >
                  <span className="iconify lucide--chevron-left size-4"></span>
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="btn btn-circle btn-xs absolute right-1 top-1/2 -translate-y-1/2 bg-base-100/80"
                >
                  <span className="iconify lucide--chevron-right size-4"></span>
                </button>
                <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-1">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setImageIndex(i)}
                      aria-label={`Imagen ${i + 1}`}
                      className={`size-1.5 rounded-full transition-colors ${
                        i === imageIndex ? "bg-primary" : "bg-base-content/30"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-circle btn-sm absolute right-3 top-3 bg-base-100/90"
          >
            <span className="iconify lucide--x size-5"></span>
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          <div className="text-center">
            <h2 className="text-lg font-bold">{product.title}</h2>
            {product.description && (
              <p className="mt-0.5 text-sm text-base-content/60">{product.description}</p>
            )}
          </div>

          {needsColor && (
            <div className="text-center">
              <p className="mb-1.5 text-sm font-semibold">Color</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {colorOptions.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setColorId(color.id)}
                    className={`btn btn-sm rounded-lg ${colorId === color.id ? "btn-primary" : "btn-outline"}`}
                  >
                    {color.description}
                  </button>
                ))}
              </div>
            </div>
          )}

          {needsSize && (
            <div className="text-center">
              <p className="mb-1.5 text-sm font-semibold">Talla</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {sizeOptions.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setSizeId(size.id)}
                    className={`btn btn-sm rounded-lg ${sizeId === size.id ? "btn-primary" : "btn-outline"}`}
                  >
                    {size.description}
                  </button>
                ))}
              </div>
            </div>
          )}

          {variantChosen && outOfStock && (
            <div className="alert alert-error py-2 text-sm">
              <span className="iconify lucide--alert-circle size-4"></span>
              <span>Sin existencias disponibles para esta variante.</span>
            </div>
          )}

          <div className="text-center">
            <p className="mb-1.5 text-sm font-semibold">Cantidad</p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="btn btn-circle btn-sm"
                disabled={outOfStock}
              >
                <span className="iconify lucide--minus size-4"></span>
              </button>
              <span className="w-8 text-center text-lg font-bold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => (remainingStock !== null ? Math.min(q + 1, remainingStock) : q + 1))}
                className="btn btn-circle btn-sm"
                disabled={outOfStock || (remainingStock !== null && quantity >= remainingStock)}
              >
                <span className="iconify lucide--plus size-4"></span>
              </button>
            </div>
            {variantChosen && remainingStock !== null && !outOfStock && (
              <p className="mt-1 text-xs text-base-content/60">Disponibles: {remainingStock}</p>
            )}
          </div>
        </div>

        <div className="border-t border-base-300 p-4">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!ready}
            className="btn btn-primary h-auto w-full rounded-xl py-3 text-lg"
          >
            {outOfStock
              ? "Sin existencias"
              : ready && unitPrice !== null
                ? `Agregar · $${(unitPrice * quantity).toFixed(2)}`
                : "Selecciona las opciones"}
          </button>
        </div>
      </div>
    </div>
  );
}
