import { ProductRead } from "@/interfaces/IProduct";
import { buildCommerceUploadUrl } from "@/lib/commerceUploads";
import { lowestPrice } from "../priceResolution";

interface ProductGridProps {
  products: ProductRead[];
  onSelect: (product: ProductRead) => void;
}

export function ProductGrid({ products, onSelect }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-base-content/50">
        <span className="iconify lucide--package-search size-16"></span>
        <p className="text-xl">No hay artículos en esta categoría</p>
      </div>
    );
  }

  return (
    <div className="grid flex-1 auto-rows-max grid-cols-2 gap-4 overflow-y-auto p-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => {
        const from = lowestPrice(product);
        const hasVariants = product.prices.length > 1;
        return (
          <button
            key={product.id}
            type="button"
            onClick={() => onSelect(product)}
            className="card bg-base-100 shadow-md transition hover:shadow-xl active:scale-95"
          >
            <figure className="aspect-square w-full bg-base-200">
              {product.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={buildCommerceUploadUrl(product.thumbnail)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="iconify lucide--image-off size-10 text-base-content/30"></span>
              )}
            </figure>
            <div className="card-body items-center p-3 text-center">
              <h3 className="line-clamp-2 text-base font-semibold">{product.title}</h3>
              {from !== null && (
                <p className="text-lg font-bold text-primary">
                  {hasVariants ? "Desde " : ""}${from.toFixed(2)}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
