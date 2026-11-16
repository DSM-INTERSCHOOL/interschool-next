"use client";

import { useState } from "react";
import { PageTitle } from "@/components/PageTitle";
import { ORDER_STATUSES, OrderRead, OrderStatus } from "@/interfaces/IOrder";
import { useEntregas, usePendingDeliveries } from "./hooks";
import { OrderSearchModal } from "./components";

// Short labels for the compact "pendientes de entrega" cards -- the full
// ORDER_STATUSES labels (e.g. "Parcialmente Entregada") are too long for a
// badge-xs pill at that card width and spill outside it.
const STATUS_SHORT_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  PLACED: "Colocada",
  PARTIALLY_DISPATCHED: "Parcial",
  COMPLETED: "Completa",
  PAID: "Pagada",
  CANCELLED: "Cancelada",
};

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "badge-ghost",
  PLACED: "badge-info",
  PARTIALLY_DISPATCHED: "badge-warning",
  COMPLETED: "badge-success",
  PAID: "badge-success",
  CANCELLED: "badge-error",
};

// dd/MM/yyyy, in the viewer's own local time -- date only, just an
// informative label on the pendientes-de-entrega list (matches Cobros'
// equivalent formatDate).
const formatDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

export default function EntregasPage() {
  const pending = usePendingDeliveries();
  const entregas = useEntregas(pending.reload);
  const [searchOpen, setSearchOpen] = useState(false);

  const clientDisplay = (order: OrderRead) => {
    const personInternalId = order.person_internal_id;
    if (!personInternalId) return "—";
    const person = pending.personsById.get(personInternalId);
    const name = person
      ? [person.given_name, person.paternal_name, person.maternal_name].filter(Boolean).join(" ")
      : null;
    return name ? `${personInternalId} - ${name}` : personInternalId;
  };

  const handleSelectFromModal = (order: OrderRead) => {
    entregas.selectOrder(order);
    setSearchOpen(false);
  };

  return (
    <>
      <PageTitle title="Entregas" />

      {entregas.successMessage && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3">
          <div className="alert alert-success shadow-lg lg:col-span-2">
            <span className="iconify lucide--check-circle size-5"></span>
            <span>{entregas.successMessage}</span>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 gap-6 lg:grid-cols-3 ${entregas.successMessage ? "mt-4" : "mt-6"}`}>
        <div className="card bg-base-100 shadow-lg lg:col-span-2">
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
                  value={entregas.orderNumber}
                  onChange={(e) => entregas.setOrderNumber(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && entregas.lookupByNumber()}
                />
                <button
                  type="button"
                  className="btn btn-primary join-item"
                  disabled={entregas.lookupLoading}
                  onClick={entregas.lookupByNumber}
                >
                  {entregas.lookupLoading ? (
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
              {entregas.lookupError && <p className="mt-1 text-sm text-error">{entregas.lookupError}</p>}
            </div>

            {entregas.selectedOrder && (
              <>
                <div className="rounded-xl border border-base-300 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <p className="text-sm text-base-content/60">Orden</p>
                      <p className="text-xl font-bold">{entregas.selectedOrder.id_orden}</p>
                    </div>
                    <span className={`badge ${STATUS_BADGE[entregas.selectedOrder.status ?? "PENDING"]}`}>
                      {ORDER_STATUSES.find((s) => s.value === entregas.selectedOrder!.status)?.label ??
                        entregas.selectedOrder.status}
                    </span>
                  </div>
                  <p className="mt-2 text-base-content/60">Cliente: {clientDisplay(entregas.selectedOrder)}</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="table table-sm w-full">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Color</th>
                        <th>Talla</th>
                        <th className="text-right">Vendido</th>
                        <th className="text-right">Entregado</th>
                        <th className="text-right">Pendiente</th>
                        <th className="text-right">Entregando ahora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entregas.selectedOrder.details.map((detail) => {
                        const remaining = detail.amount - detail.dispatched;
                        return (
                          <tr key={detail.id}>
                            <td>{detail.product_title ?? `Producto #${detail.product_id}`}</td>
                            <td>{detail.color ?? "—"}</td>
                            <td>{detail.size ?? "—"}</td>
                            <td className="text-right">{detail.amount}</td>
                            <td className="text-right">{detail.dispatched}</td>
                            <td className="text-right font-medium">{remaining}</td>
                            <td className="text-right">
                              {remaining > 0 ? (
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  className="input input-bordered input-sm w-20 text-right"
                                  value={entregas.quantities[detail.id] ?? ""}
                                  placeholder="0"
                                  onChange={(e) => entregas.setQuantity(detail.id, e.target.value)}
                                />
                              ) : (
                                <span className="badge badge-success badge-sm">Completo</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={entregas.fillAllPending}>
                    Entregar todo lo pendiente
                  </button>
                </div>

                {entregas.confirmError && (
                  <div className="alert alert-error">
                    <span className="iconify lucide--alert-circle size-5"></span>
                    <span>{entregas.confirmError}</span>
                  </div>
                )}

                <div className="card-actions justify-end">
                  <button type="button" className="btn btn-ghost" onClick={entregas.reset}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!entregas.canConfirm}
                    onClick={entregas.confirmDispatch}
                  >
                    {entregas.confirmLoading && <span className="loading loading-spinner loading-sm"></span>}
                    Registrar entrega
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h3 className="card-title text-lg">
                <span className="iconify lucide--truck size-5"></span>
                Pendientes de entrega
              </h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                title="Actualizar lista"
                onClick={() => pending.reload()}
                disabled={pending.loading}
              >
                <span className={`iconify lucide--refresh-cw size-4 ${pending.loading ? "animate-spin" : ""}`}></span>
              </button>
            </div>
            {pending.loading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            ) : pending.error ? (
              <p className="text-sm text-error">{pending.error}</p>
            ) : pending.orders.length === 0 ? (
              <p className="py-6 text-center text-sm text-base-content/60">No hay órdenes pendientes de entrega</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {pending.orders.map((order) => (
                  <li key={order.id}>
                    <button
                      type="button"
                      className="flex w-full items-start justify-between gap-2 rounded-lg border border-base-300 p-3 text-left hover:bg-base-200"
                      onClick={() => entregas.selectOrder(order)}
                    >
                      <div className="min-w-0">
                        <p className="font-medium">Orden {order.id_orden}</p>
                        <p className="text-xs text-base-content/60">{clientDisplay(order)}</p>
                        <p className="text-xs text-base-content/40">
                          {formatDate(order.created) && <>Orden: {formatDate(order.created)}</>}
                          {formatDate(order.created) && formatDate(order.paid_at) && " · "}
                          {formatDate(order.paid_at) && <>Pago: {formatDate(order.paid_at)}</>}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-bold">${Number(order.total).toFixed(2)}</p>
                        <span className={`badge badge-sm whitespace-nowrap ${STATUS_BADGE[order.status ?? "PENDING"]}`}>
                          {STATUS_SHORT_LABEL[order.status ?? "PENDING"]}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {searchOpen && (
        <OrderSearchModal
          orders={pending.orders}
          loading={pending.loading}
          error={pending.error}
          personsById={pending.personsById}
          onSelect={handleSelectFromModal}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </>
  );
}
