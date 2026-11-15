import { useMemo, useState } from "react";
import { ProductRead } from "@/interfaces/IProduct";
import { buildCommerceUploadUrl } from "@/lib/commerceUploads";
import { lowestPrice } from "../priceResolution";

interface ProductSearchModalProps {
  products: ProductRead[];
  onSelect: (product: ProductRead) => void;
  onClose: () => void;
}

const MAX_RESULTS = 30;

// Quick find-by-name/code, bypassing category browsing entirely -- always
// searches the full catalog (ignores whatever category tile is currently
// selected on OrderingScreen), since the point is to skip browsing.
export function ProductSearchModal({ products, onSelect, onClose }: ProductSearchModalProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return products
      .filter(
        (product) =>
          product.title.toLowerCase().includes(normalized) ||
          (product.product_key ?? "").toLowerCase().includes(normalized)
      )
      .slice(0, MAX_RESULTS);
  }, [products, query]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <div className="flex h-full w-full flex-col overflow-hidden bg-base-100 shadow-2xl sm:h-auto sm:max-h-[85vh] sm:max-w-lg sm:rounded-3xl">
        <div className="flex shrink-0 items-center gap-2 border-b border-base-300 p-4">
          <input
            type="text"
            autoFocus
            placeholder="Buscar producto por nombre o código..."
            className="input input-bordered input-lg flex-1 text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" onClick={onClose} className="btn btn-circle btn-ghost">
            <span className="iconify lucide--x size-6"></span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {!query.trim() ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-base-content/50">
              <span className="iconify lucide--search size-16"></span>
              <p className="text-lg">Escribe para buscar un producto</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-base-content/50">
              <span className="iconify lucide--package-search size-16"></span>
              <p className="text-lg">Sin resultados para &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {results.map((product) => {
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
          )}
        </div>
      </div>
    </div>
  );
}
