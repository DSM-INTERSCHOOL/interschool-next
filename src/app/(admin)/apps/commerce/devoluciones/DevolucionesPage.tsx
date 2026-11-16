"use client";

import { useState } from "react";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ORDER_STATUSES, OrderRead, OrderStatus } from "@/interfaces/IOrder";
import { ProductSearchSelect } from "../components";
import { resolvePrice } from "../orders/shared/priceResolution";
import { useProductAvailability } from "../orders/shared/hooks/useProductAvailability";
import { useDevolucionesForm } from "./hooks";
import { OrderSearchModal } from "./components";

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "badge-ghost",
  PLACED: "badge-info",
  PARTIALLY_DISPATCHED: "badge-warning",
  COMPLETED: "badge-success",
  PAID: "badge-success",
  CANCELLED: "badge-error",
};

export default function DevolucionesPage() {
  const form = useDevolucionesForm();
  const { getAvailableQty } = useProductAvailability(form.products);
  const [searchOpen, setSearchOpen] = useState(false);

  // ---- new-item picker local state ----
  const [newProductId, setNewProductId] = useState<number | "">("");
  const [newColorId, setNewColorId] = useState<number | "">("");
  const [newSizeId, setNewSizeId] = useState<number | "">("");
  const [newAmount, setNewAmount] = useState(1);

  const clientDisplay = (order: OrderRead) => {
    const personInternalId = order.person_internal_id;
    if (!personInternalId) return "—";
    const person = form.personsById.get(personInternalId);
    const name = person
      ? [person.given_name, person.paternal_name, person.maternal_name].filter(Boolean).join(" ")
      : null;
    return name ? `${personInternalId} - ${name}` : personInternalId;
  };

  const handleSelectFromModal = (order: OrderRead) => {
    form.selectOrder(order);
    setSearchOpen(false);
  };

  const newProduct = newProductId ? form.products.find((p) => p.id === newProductId) ?? null : null;
  const newColorOptions = newProduct ? form.colors.filter((c) => newProduct.color_ids.includes(c.id)) : [];
  const newSizeOptions = newProduct ? form.sizes.filter((s) => newProduct.size_ids.includes(s.id)) : [];
  const newPrice = newProduct
    ? resolvePrice(newProduct, newColorId === "" ? null : newColorId, newSizeId === "" ? null : newSizeId)
    : null;
  const newStock =
    newProduct && (newColorOptions.length === 0 || newColorId !== "") && (newSizeOptions.length === 0 || newSizeId !== "")
      ? getAvailableQty(newProduct.id, newColorId === "" ? null : newColorId, newSizeId === "" ? null : newSizeId)
      : null;
  const newLineReady =
    newProduct !== null &&
    newPrice !== null &&
    (newColorOptions.length === 0 || newColorId !== "") &&
    (newSizeOptions.length === 0 || newSizeId !== "") &&
    newAmount > 0 &&
    (newStock === null || newAmount <= newStock);

  const handleAddNewItem = () => {
    if (!newProduct || newPrice === null) return;
    const colorLabel = newColorId === "" ? null : newColorOptions.find((c) => c.id === newColorId)?.description ?? null;
    const sizeLabel = newSizeId === "" ? null : newSizeOptions.find((s) => s.id === newSizeId)?.description ?? null;
    form.addNewItem({
      key: `${newProduct.id}:${newColorId}:${newSizeId}`,
      productId: newProduct.id,
      title: newProduct.title,
      colorId: newColorId === "" ? null : newColorId,
      colorLabel,
      sizeId: newSizeId === "" ? null : newSizeId,
      sizeLabel,
      unitPrice: newPrice,
      quantity: newAmount,
    });
    setNewProductId("");
    setNewColorId("");
    setNewSizeId("");
    setNewAmount(1);
  };

  return (
    <>
      <PageTitle
        title="Devoluciones y Cambios"
      />

      {form.successMessage && (
        <div className="mt-6 alert alert-success shadow-lg">
          <span className="iconify lucide--check-circle size-5"></span>
          <span>{form.successMessage}</span>
        </div>
      )}

      <div className={form.successMessage ? "mt-4" : "mt-6"}>
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body gap-5!">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Número de orden</span>
              </label>
              <div className="join">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej. 1024"
                  className="input input-bordered join-item w-full"
                  value={form.orderNumber}
                  onChange={(e) => form.setOrderNumber(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && form.lookupByNumber()}
                />
                <button
                  type="button"
                  className="btn btn-primary join-item"
                  disabled={form.lookupLoading}
                  onClick={form.lookupByNumber}
                >
                  {form.lookupLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <span className="iconify lucide--search size-4"></span>
                  )}
                </button>
                <button type="button" className="btn btn-outline join-item" onClick={() => setSearchOpen(true)}>
                  <span className="iconify lucide--list size-4"></span>
                  Buscar
                </button>
              </div>
              {form.lookupError && <p className="mt-1 text-sm text-error">{form.lookupError}</p>}
            </div>

            {form.selectedOrder && (
              <>
                <div className="rounded-xl border border-base-300 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <p className="text-sm text-base-content/60">Orden</p>
                      <p className="text-xl font-bold">{form.selectedOrder.id_orden}</p>
                    </div>
                    <span className={`badge ${STATUS_BADGE[form.selectedOrder.status ?? "PENDING"]}`}>
                      {ORDER_STATUSES.find((s) => s.value === form.selectedOrder!.status)?.label ??
                        form.selectedOrder.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-base-content/60">Cliente: {clientDisplay(form.selectedOrder)}</p>
                    <p className="text-xl font-bold">${Number(form.selectedOrder.total).toFixed(2)}</p>
                  </div>
                </div>

                {form.catalogsLoading ? (
                  <LoadingSpinner size="sm" message="Cargando catálogos..." />
                ) : (
                  <>
                    <div>
                      <p className="mb-2 font-semibold">Artículos a devolver</p>
                      <div className="overflow-x-auto">
                        <table className="table table-sm w-full">
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th>Color</th>
                              <th>Talla</th>
                              <th className="text-right">Vendido</th>
                              <th className="text-right">Entregado</th>
                              <th className="text-right">Devuelto</th>
                              <th className="text-right">Disponible</th>
                              <th className="w-24">A devolver</th>
                              <th className="text-right">Costo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {form.selectedOrder.details.map((detail) => {
                              const available = form.maxReturnable(detail.id);
                              return (
                                <tr key={detail.id}>
                                  <td>{detail.product_title ?? `Producto #${detail.product_id}`}</td>
                                  <td>{detail.color ?? "—"}</td>
                                  <td>{detail.size ?? "—"}</td>
                                  <td className="text-right">{detail.amount}</td>
                                  <td className="text-right">{detail.dispatched}</td>
                                  <td className="text-right">{detail.returned}</td>
                                  <td className="text-right font-medium">{available}</td>
                                  <td>
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      className="input input-bordered input-sm w-20 text-right"
                                      placeholder="0"
                                      disabled={available <= 0}
                                      title={available <= 0 ? "No hay piezas entregadas disponibles para devolver" : undefined}
                                      value={form.returnQuantities[detail.id] ?? ""}
                                      onChange={(e) => form.setReturnQuantity(detail.id, e.target.value)}
                                    />
                                  </td>
                                  <td className="text-right">${form.returnCostFor(detail.id).toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      {form.noneDeliverable && (
                        <p className="mt-2 text-sm text-base-content/60">
                          Esta orden no tiene piezas entregadas disponibles para devolver (nada se ha entregado, o
                          ya todo fue devuelto).
                        </p>
                      )}
                    </div>

                    <label className="label w-fit cursor-pointer gap-3">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={form.isExchange}
                        onChange={(e) => form.setIsExchange(e.target.checked)}
                      />
                      <span className="label-text">¿Es un cambio por otro artículo?</span>
                    </label>

                    {form.isExchange && (
                      <div className="rounded-xl border border-base-300 p-4">
                        <p className="mb-2 font-semibold">Artículo nuevo</p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
                          <ProductSearchSelect
                            products={form.products}
                            value={newProductId}
                            onChange={(id) => {
                              setNewProductId(id);
                              setNewColorId("");
                              setNewSizeId("");
                            }}
                          />
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
                            disabled={!newLineReady}
                            onClick={handleAddNewItem}
                          >
                            {newPrice !== null ? `Agregar · $${newPrice.toFixed(2)}` : "Agregar"}
                          </button>
                        </div>

                        {newProduct && (
                          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                            <span className="text-base-content/70">
                              Precio:{" "}
                              <span className="font-medium text-base-content">
                                {newPrice !== null ? `$${newPrice.toFixed(2)}` : "—"}
                              </span>
                            </span>
                            <span className="text-base-content/70">
                              Stock disponible:{" "}
                              <span
                                className={`font-medium ${newStock !== null && newStock <= 0 ? "text-error" : "text-base-content"}`}
                              >
                                {newStock === null ? "sin límite" : newStock}
                              </span>
                            </span>
                            {newStock !== null && newAmount > newStock && (
                              <span className="text-error">La cantidad excede el stock disponible</span>
                            )}
                          </div>
                        )}

                        {form.newItems.length > 0 && (
                          <div className="mt-4 overflow-x-auto">
                            <table className="table table-sm w-full">
                              <thead>
                                <tr>
                                  <th>Producto</th>
                                  <th>Color</th>
                                  <th>Talla</th>
                                  <th className="text-right">Cantidad</th>
                                  <th className="text-right">Precio</th>
                                  <th className="text-right">Total</th>
                                  <th></th>
                                </tr>
                              </thead>
                              <tbody>
                                {form.newItems.map((item) => (
                                  <tr key={item.key}>
                                    <td>{item.title}</td>
                                    <td>{item.colorLabel ?? "—"}</td>
                                    <td>{item.sizeLabel ?? "—"}</td>
                                    <td className="text-right">{item.quantity}</td>
                                    <td className="text-right">${item.unitPrice.toFixed(2)}</td>
                                    <td className="text-right font-medium">
                                      ${(item.unitPrice * item.quantity).toFixed(2)}
                                    </td>
                                    <td>
                                      <button
                                        type="button"
                                        className="btn btn-ghost btn-xs text-error"
                                        onClick={() => form.removeNewItem(item.key)}
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
                    )}

                    {form.hasReturnLines && (
                      <div className="flex flex-col gap-2 rounded-lg bg-base-200 px-4 py-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-base-content/70">Total a devolver</span>
                          <span className="font-medium">${form.totalADevolver.toFixed(2)}</span>
                        </div>
                        {form.isExchange && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-base-content/70">Total a entregar</span>
                            <span className="font-medium">${form.totalAEntregar.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between border-t border-base-300 pt-2 text-lg font-bold">
                          <span>
                            {form.diff > 0
                              ? "El cliente debe pagar"
                              : form.diff < 0
                                ? "A favor del cliente"
                                : "Diferencia"}
                          </span>
                          <span className={form.diff > 0 ? "text-error" : form.diff < 0 ? "text-success" : ""}>
                            ${Math.abs(form.diff).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    {form.hasReturnLines && form.diff > 0 && (
                      <div className="rounded-xl border border-base-300 p-4">
                        <p className="mb-2 font-semibold">Forma de pago</p>
                        <div className="flex flex-wrap items-center gap-2">
                          {form.visibleTenderMethods.map((m) => (
                            <button
                              key={m.value}
                              type="button"
                              className={`btn btn-sm ${form.chargeMethod === m.value ? "btn-primary" : "btn-outline"}`}
                              onClick={() => form.setChargeMethod(m.value)}
                            >
                              {m.label}
                            </button>
                          ))}
                          <button
                            type="button"
                            className={`btn btn-sm ${form.chargeMethod === "SALDO" ? "btn-primary" : "btn-outline"}`}
                            disabled={form.customerBalance === null || form.customerBalance < form.diff}
                            title={
                              form.customerBalance === null
                                ? "La orden no tiene un cliente asociado"
                                : form.customerBalance < form.diff
                                  ? "El cliente no tiene saldo suficiente"
                                  : undefined
                            }
                            onClick={() => form.setChargeMethod("SALDO")}
                          >
                            Saldo
                          </button>
                          {form.customerBalance !== null && (
                            <span className="text-xs text-base-content/60">
                              Saldo del cliente: ${form.customerBalance.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {form.chargeMethod === "EFECTIVO" && (
                          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="form-control">
                              <label className="label py-1">
                                <span className="label-text text-xs">Efectivo recibido</span>
                              </label>
                              <input
                                type="text"
                                inputMode="decimal"
                                className="input input-bordered input-sm w-full"
                                value={form.cashTendered}
                                onChange={(e) => form.setCashTendered(e.target.value)}
                              />
                              {form.cashInsufficient && (
                                <p className="mt-1 text-sm text-error">El pago es menor al total</p>
                              )}
                            </div>
                            <div className="form-control">
                              <label className="label py-1">
                                <span className="label-text text-xs">Cambio</span>
                              </label>
                              <div className="input input-bordered input-sm flex w-full items-center font-bold">
                                ${form.change.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {form.hasReturnLines && form.diff < 0 && (
                      <div className="rounded-xl border border-base-300 p-4">
                        <p className="mb-2 font-semibold">Forma de devolución</p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className={`btn btn-sm ${form.refundType === "FISICO" ? "btn-primary" : "btn-outline"}`}
                            onClick={() => form.setRefundType("FISICO")}
                          >
                            Devolución física
                          </button>
                          <button
                            type="button"
                            className={`btn btn-sm ${form.refundType === "SALDO" ? "btn-primary" : "btn-outline"}`}
                            disabled={!form.selectedOrder.person_internal_id}
                            title={!form.selectedOrder.person_internal_id ? "La orden no tiene un cliente asociado" : undefined}
                            onClick={() => form.setRefundType("SALDO")}
                          >
                            Abonar a saldo
                          </button>
                        </div>
                        {form.refundType === "FISICO" && (
                          <div className="mt-3">
                            <p className="mb-2 text-sm text-base-content/60">¿Con qué se devuelve?</p>
                            <div className="flex flex-wrap gap-2">
                              {form.visibleRefundMethods.map((m) => (
                                <button
                                  key={m.value}
                                  type="button"
                                  className={`btn btn-sm ${form.refundPaymentMethod === m.value ? "btn-primary" : "btn-outline"}`}
                                  onClick={() => form.setRefundPaymentMethod(m.value)}
                                >
                                  {m.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {form.submitError && (
                      <div className="alert alert-error">
                        <span className="iconify lucide--alert-circle size-6"></span>
                        <div>{form.submitError}</div>
                      </div>
                    )}

                    <div className="card-actions justify-end">
                      <button type="button" className="btn btn-ghost" onClick={form.reset}>
                        Cancelar
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={!form.canSubmit}
                        onClick={form.submit}
                      >
                        {form.submitLoading && <span className="loading loading-spinner loading-sm"></span>}
                        {form.isExchange ? "Registrar cambio" : "Registrar devolución"}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {searchOpen && (
        <OrderSearchModal
          personsById={form.personsById}
          onSelect={handleSelectFromModal}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </>
  );
}
