"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ProductRead } from "@/interfaces/IProduct";

interface ProductSearchSelectProps {
  products: ProductRead[];
  value: number | "";
  onChange: (productId: number | "") => void;
  placeholder?: string;
}

interface MenuPosition {
  top: number;
  left: number;
  width: number;
}

const MAX_RESULTS = 50;

// Typeahead combobox over an already-fetched product list -- a plain
// <select> becomes unusable once a school has many products, so typing
// filters by title (or product_key) instead of scrolling a long list.
// No headless combobox library is installed in this app, so this is
// hand-rolled; keep it generic enough to reuse anywhere else a product
// needs picking from a long list (e.g. the KIT sub-product picker).
//
// The option list is rendered through a portal into document.body, fixed-
// positioned against the input's own bounding rect, instead of living
// inside this component's DOM subtree. Used inside a horizontally-
// scrollable table (overflow-x-auto), plain `absolute` positioning gets
// clipped: setting overflow-x alone forces the browser to compute
// overflow-y as auto too (a CSS overflow quirk), so anything escaping the
// cell downward is cut off instead of overlapping the rows below it.
// Portaling sidesteps that entirely.
export function ProductSearchSelect({ products, value, onChange, placeholder }: ProductSearchSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  // String-compared, not strict === : callers that store this in generic
  // form-line state (see MovementLineItemsEditor) round-trip the id through
  // a plain string (every other <select> in that table is native, so the
  // browser does this coercion for free; this component has to do it
  // itself), so `value` can arrive as either the number or its string form.
  const selectedProduct = products.find((product) => String(product.id) === String(value)) ?? null;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setQuery(selectedProduct ? selectedProduct.title : "");
    }
  }, [selectedProduct, open]);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const rect = inputRef.current?.getBoundingClientRect();
      if (rect) {
        setMenuPosition({ top: rect.bottom, left: rect.left, width: rect.width });
      }
    };
    updatePosition();

    // `true` = capture phase, so this also fires for scroll on the table's
    // own overflow-x-auto wrapper, not just window-level scrolling.
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
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
          ref={inputRef}
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
      {open &&
        mounted &&
        menuPosition &&
        createPortal(
          <ul
            ref={menuRef}
            className="menu fixed z-[100] mt-1 max-h-64 flex-nowrap overflow-y-auto rounded-box border border-base-300 bg-base-100 p-1 shadow-lg"
            style={{ top: menuPosition.top, left: menuPosition.left, width: menuPosition.width }}
          >
            {results.length === 0 ? (
              <li className="px-3 py-2 text-sm text-base-content/60">Sin resultados</li>
            ) : (
              results.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(product)}
                    className={String(product.id) === String(value) ? "active" : ""}
                  >
                    {product.title}
                    {product.product_key && (
                      <span className="text-xs text-base-content/50">({product.product_key})</span>
                    )}
                  </button>
                </li>
              ))
            )}
          </ul>,
          document.body
        )}
    </div>
  );
}
