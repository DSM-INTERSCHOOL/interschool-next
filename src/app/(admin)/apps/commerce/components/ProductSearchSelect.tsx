"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ProductRead } from "@/interfaces/IProduct";

interface ProductSearchSelectProps {
  products: ProductRead[];
  value: number | "";
  onChange: (productId: number | "") => void;
  placeholder?: string;
}

const MAX_RESULTS = 50;

// Typeahead combobox over an already-fetched product list -- a plain
// <select> becomes unusable once a school has many products, so typing
// filters by title (or product_key) instead of scrolling a long list.
// No headless combobox library is installed in this app, so this is
// hand-rolled; keep it generic enough to reuse anywhere else a product
// needs picking from a long list (e.g. the KIT sub-product picker).
export function ProductSearchSelect({ products, value, onChange, placeholder }: ProductSearchSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedProduct = products.find((product) => product.id === value) ?? null;

  useEffect(() => {
    if (!open) {
      setQuery(selectedProduct ? selectedProduct.title : "");
    }
  }, [selectedProduct, open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = normalizedQuery
      ? products.filter(
          (product) =>
            product.title.toLowerCase().includes(normalizedQuery) ||
            (product.product_key ?? "").toLowerCase().includes(normalizedQuery)
        )
      : products;
    return filtered.slice(0, MAX_RESULTS);
  }, [products, query]);

  const handleSelect = (product: ProductRead) => {
    onChange(product.id);
    setQuery(product.title);
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center gap-1">
        <input
          type="text"
          className="input input-bordered input-sm w-full"
          placeholder={placeholder ?? "Buscar producto..."}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {value !== "" && (
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={handleClear}
            title="Quitar selección"
          >
            <span className="iconify lucide--x size-3"></span>
          </button>
        )}
      </div>
      {open && (
        <ul className="menu absolute z-20 mt-1 max-h-64 w-full flex-nowrap overflow-y-auto rounded-box border border-base-300 bg-base-100 p-1 shadow-lg">
          {results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-base-content/60">Sin resultados</li>
          ) : (
            results.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(product)}
                  className={product.id === value ? "active" : ""}
                >
                  {product.title}
                  {product.product_key && (
                    <span className="text-xs text-base-content/50">({product.product_key})</span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
