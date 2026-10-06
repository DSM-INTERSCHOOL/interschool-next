import { useMemo, useState } from "react";
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
}

export function ProductPickerModal({ product, colors, sizes, onClose, onAdd }: ProductPickerModalProps) {
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

  const needsColor = colorOptions.length > 0;
  const needsSize = sizeOptions.length > 0;
  const unitPrice = resolvePrice(product, colorId, sizeId);
  const ready = (!needsColor || colorId !== null) && (!needsSize || sizeId !== null) && unitPrice !== null;

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
        className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl bg-base-100 shadow-2xl sm:max-w-lg sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-video w-full bg-base-200">
          {product.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={buildCommerceUploadUrl(product.thumbnail)} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="iconify lucide--image-off size-16 text-base-content/30"></span>
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="btn btn-circle btn-sm absolute right-3 top-3 bg-base-100/90"
          >
            <span className="iconify lucide--x size-5"></span>
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
          <div>
            <h2 className="text-2xl font-bold">{product.title}</h2>
            {product.description && <p className="mt-1 text-base-content/60">{product.description}</p>}
          </div>

          {needsColor && (
            <div>
              <p className="mb-2 font-semibold">Color</p>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setColorId(color.id)}
                    className={`btn btn-lg h-auto rounded-xl px-6 py-3 ${
                      colorId === color.id ? "btn-primary" : "btn-outline"
                    }`}
                  >
                    {color.description}
                  </button>
                ))}
              </div>
            </div>
          )}

          {needsSize && (
            <div>
              <p className="mb-2 font-semibold">Talla</p>
              <div className="flex flex-wrap gap-2">
                {sizeOptions.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setSizeId(size.id)}
                    className={`btn btn-lg h-auto rounded-xl px-6 py-3 ${
                      sizeId === size.id ? "btn-primary" : "btn-outline"
                    }`}
                  >
                    {size.description}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 font-semibold">Cantidad</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="btn btn-circle btn-lg"
              >
                <span className="iconify lucide--minus size-6"></span>
              </button>
              <span className="w-10 text-center text-2xl font-bold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="btn btn-circle btn-lg"
              >
                <span className="iconify lucide--plus size-6"></span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-base-300 p-6">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!ready}
            className="btn btn-primary btn-lg h-auto w-full rounded-2xl py-4 text-xl"
          >
            {ready && unitPrice !== null
              ? `Agregar · $${(unitPrice * quantity).toFixed(2)}`
              : "Selecciona las opciones"}
          </button>
        </div>
      </div>
    </div>
  );
}
