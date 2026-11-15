"use client";

import { useState } from "react";
import { AppLink as Link } from "@/components/AppLink";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ORDER_STATUSES } from "@/interfaces/IOrder";
import { resolvePrice } from "../shared/priceResolution";
import { useOrderEdit } from "./hooks/useOrderEdit";

interface EditOrderPageProps {
  orderId: number;
}

export default function EditOrderPage({ orderId }: EditOrderPageProps) {
  const {
    order,
    products,
    colors,
    sizes,
    loading,
    error,
    actionLoading,
    actionError,
    saveOrderInfo,
    updateLineQuantity,
    removeLine,
    addLine,
  } = useOrderEdit(orderId);

  const [reference, setReference] = useState<string | null>(null);
  const [collectedBy, setCollectedBy] = useState<string | null>(null);

  const [newProductId, setNewProductId] = useState<number | "">("");
  const [newColorId, setNewColorId] = useState<number | "">("");
  const [newSizeId, setNewSizeId] = useState<number | "">("");
  const [newAmount, setNewAmount] = useState(1);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner message="Cargando orden..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="alert alert-error">
        <span className="iconify lucide--alert-circle size-6"></span>
        <div>{error ?? "Orden no encontrada"}</div>
      </div>
    );
  }

  const locked = order.status === "CANCELLED";
  const referenceValue = reference ?? order.reference ?? "";
  const collectedByValue = collectedBy ?? order.collected_by ?? "";

  const newProduct = newProductId ? products.find((p) => p.id === newProductId) ?? null : null;
  const newColorOptions = newProduct ? colors.filter((c) => newProduct.color_ids.includes(c.id)) : [];
  const newSizeOptions = newProduct ? sizes.filter((s) => newProduct.size_ids.includes(s.id)) : [];
  const newPrice = newProduct
    ? resolvePrice(newProduct, newColorId === "" ? null : newColorId, newSizeId === "" ? null : newSizeId)
    : null;
  const newLineReady =
    newProduct !== null &&
    newPrice !== null &&
    (newColorOptions.length === 0 || newColorId !== "") &&
    (newSizeOptions.length === 0 || newSizeId !== "") &&
    newAmount > 0;

  const handleAddLine = async () => {
    if (!newProduct || newPrice === null) return;
    await addLine({
      productId: newProduct.id,
      color: newColorId === "" ? undefined : colors.find((c) => c.id === newColorId)?.description,
      size: newSizeId === "" ? undefined : sizes.find((s) => s.id === newSizeId)?.description,
      amount: newAmount,
      price: newPrice,
    });
    setNewProductId("");
    setNewColorId("");
    setNewSizeId("");
    setNewAmount(1);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Orden #{order.id_orden}</h2>
          <p className="text-base-content/60">
            {ORDER_STATUSES.find((s) => s.value === order.status)?.label ?? order.status}
          </p>
        </div>
        <Link href="/apps/commerce/orders" className="btn btn-ghost btn-sm">
          <span className="iconify lucide--arrow-left size-4"></span>
          Volver
        </Link>
      </div>

      {locked && (
        <div className="alert alert-warning">
          <span className="iconify lucide--lock size-5"></span>
          <span>Esta orden está cancelada y no se puede modificar.</span>
        </div>
      )}

      {actionError && (
        <div className="alert alert-error">
          <span className="iconify lucide--alert-circle size-6"></span>
          <div>{actionError}</div>
        </div>
      )}

      {!locked && (
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title text-lg">Agregar artículo</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
              <select
                className="select select-bordered select-sm w-full"
                value={newProductId}
                onChange={(e) => {
                  setNewProductId(e.target.value ? Number(e.target.value) : "");
                  setNewColorId("");
                  setNewSizeId("");
                }}
              >
                <option value="">Selecciona un producto</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <select
                className="select select-bordered select-sm w-full"
                value={newColorId}
                disabled={newColorOptions.length === 0}
                onChange={(e) => setNewColorId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">{newColorOptions.length ? "Color" : "— sin color —"}</option>
                {newColorOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.description}
                  </option>
                ))}
              </select>
              <select
                className="select select-bordered select-sm w-full"
                value={newSizeId}
                disabled={newSizeOptions.length === 0}
                onChange={(e) => setNewSizeId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">{newSizeOptions.length ? "Talla" : "— sin talla —"}</option>
                {newSizeOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.description}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                className="input input-bordered input-sm w-full"
                value={newAmount}
                onChange={(e) => setNewAmount(Number(e.target.value) || 1)}
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={!newLineReady || actionLoading}
                onClick={handleAddLine}
              >
                {newPrice !== null ? `Agregar · $${newPrice.toFixed(2)}` : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h3 className="card-title text-lg">Artículos</h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Color</th>
                  <th>Talla</th>
                  <th className="w-32">Cantidad</th>
                  <th className="text-right">Precio</th>
                  <th className="text-right">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {order.details.map((detail) => {
                  return (
                    <tr key={detail.id}>
                      <td>{detail.product_title ?? `Producto #${detail.product_id}`}</td>
                      <td>{detail.color ?? "—"}</td>
                      <td>{detail.size ?? "—"}</td>
                      <td>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="btn btn-circle btn-xs"
                            disabled={locked || actionLoading || detail.amount <= 1}
                            onClick={() => updateLineQuantity(detail.id, detail.amount - 1)}
                          >
                            <span className="iconify lucide--minus size-3"></span>
                          </button>
                          <span className="w-6 text-center">{detail.amount}</span>
                          <button
                            type="button"
                            className="btn btn-circle btn-xs"
                            disabled={locked || actionLoading}
                            onClick={() => updateLineQuantity(detail.id, detail.amount + 1)}
                          >
                            <span className="iconify lucide--plus size-3"></span>
                          </button>
                        </div>
                      </td>
                      <td className="text-right">${Number(detail.price).toFixed(2)}</td>
                      <td className="text-right font-medium">${Number(detail.total).toFixed(2)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs text-error"
                          disabled={locked || actionLoading}
                          title="Quitar"
                          onClick={() => removeLine(detail.id)}
                        >
                          <span className="iconify lucide--trash-2 size-4"></span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {order.details.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-base-content/50 py-6">
                      Sin artículos
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} className="text-right text-lg font-bold">
                    Total
                  </td>
                  <td className="text-right text-lg font-bold">${Number(order.total).toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

        </div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <h3 className="card-title text-lg">Datos de la orden</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Referencia</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={referenceValue}
                disabled={locked}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Recoge</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={collectedByValue}
                disabled={locked}
                onChange={(e) => setCollectedBy(e.target.value)}
              />
            </div>
          </div>
          <div className="card-actions justify-end mt-2">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={locked || actionLoading || (reference === null && collectedBy === null)}
              onClick={() =>
                saveOrderInfo({
                  reference: referenceValue,
                  collection_options: { collected_by: collectedByValue },
                })
              }
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
