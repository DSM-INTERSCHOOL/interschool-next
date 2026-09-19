"use client";

import { useState } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ProductRead } from "@/interfaces/IProduct";
import { SubProductRow } from "../hooks";

interface SubProductPickerProps {
  candidates: ProductRead[];
  loading: boolean;
  error: string | null;
  subProducts: SubProductRow[];
  onAdd: (row: SubProductRow) => void;
  onRemove: (subProductId: number) => void;
}

export function SubProductPicker({
  candidates,
  loading,
  error,
  subProducts,
  onAdd,
  onRemove,
}: SubProductPickerProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [quantity, setQuantity] = useState("1");

  const filtered = candidates.filter(
    (candidate) =>
      !subProducts.some((row) => row.sub_product_id === candidate.id) &&
      candidate.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (selectedId === "") return;
    const candidate = candidates.find((c) => c.id === selectedId);
    if (!candidate) return;
    const parsedQuantity = Number(quantity);
    if (!parsedQuantity || parsedQuantity <= 0) return;
    onAdd({ sub_product_id: candidate.id, quantity: parsedQuantity, _title: candidate.title });
    setSelectedId("");
    setSearch("");
    setQuantity("1");
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="label">
          <span className="label-text">Buscar producto para agregar</span>
        </label>
        {loading ? (
          <LoadingSpinner size="sm" message="Cargando productos..." />
        ) : error ? (
          <div className="text-error text-sm">{error}</div>
        ) : (
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              className="input input-bordered flex-1"
              placeholder="Buscar por título..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedId("");
              }}
            />
            <select
              className="select select-bordered md:w-64"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">Selecciona un producto</option>
              {filtered.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.title}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              className="input input-bordered md:w-24"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <button type="button" className="btn btn-outline" onClick={handleAdd} disabled={!selectedId}>
              <span className="iconify lucide--plus size-4"></span>
              Agregar
            </button>
          </div>
        )}
      </div>

      {subProducts.length > 0 && (
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {subProducts.map((row) => (
                <tr key={row.sub_product_id}>
                  <td>{row._title}</td>
                  <td>{row.quantity}</td>
                  <td className="text-right">
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-error"
                      onClick={() => onRemove(row.sub_product_id)}
                    >
                      <span className="iconify lucide--trash-2 size-4"></span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
