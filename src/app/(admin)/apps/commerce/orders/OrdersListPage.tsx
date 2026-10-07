"use client";

import { useState } from "react";
import { AppLink as Link } from "@/components/AppLink";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { getOrgConfig } from "@/lib/orgConfig";
import { ORDER_STATUSES, OrderRead, OrderStatus } from "@/interfaces/IOrder";
import { ORDER_MODES } from "@/interfaces/ITopCategory";
import { cancelOrder } from "@/services/order.service";
import { useOrdersList } from "./hooks";

// A cancelled order is a dead end either way; everything else can still
// be edited or cancelled from here.
const isActionable = (status: OrderStatus | null) => status !== "CANCELLED";

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "badge-ghost",
  PLACED: "badge-info",
  PARTIALLY_DISPATCHED: "badge-warning",
  COMPLETED: "badge-success",
  PAID: "badge-success",
  CANCELLED: "badge-error",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  VENTANILLA: "Ventanilla",
  SPEI: "SPEI",
};

// dd/MM/yyyy HH:mm, in the viewer's own local time.
const formatDateTime = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function OrdersListPage() {
  const {
    orders,
    loading,
    error,
    personsById,
    status,
    setStatus,
    createdBy,
    setCreatedBy,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    clearFilters,
    reload,
  } = useOrdersList();

  const [cancelTarget, setCancelTarget] = useState<OrderRead | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const hasFilters = Boolean(status || createdBy || startDate || endDate);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      setCancelLoading(true);
      setCancelError(null);
      const { schoolId } = getOrgConfig();
      await cancelOrder({ schoolId, orderId: cancelTarget.id });
      setCancelTarget(null);
      await reload();
    } catch (err: any) {
      setCancelError(err.response?.data?.detail || err.message || "No se pudo cancelar la orden");
    } finally {
      setCancelLoading(false);
    }
  };

  // order_mode is only populated for orders created after that field
  // existed. For older rows it's null -- fall back to inferring from
  // whether the client and the person who placed it are the same person,
  // same rule the field itself was introduced to stop relying on for new
  // orders (an operator selling to themselves is indistinguishable this
  // way, but there's no better signal available for legacy data).
  const orderModeLabel = (order: OrderRead) => {
    const mode =
      order.order_mode ??
      (order.person_internal_id === order.created_by_person_internal_id ? "SELF_SERVICE" : "OPERATOR");
    return ORDER_MODES.find((m) => m.value === mode)?.label ?? mode;
  };

  const clientDisplay = (personInternalId: string | null) => {
    if (!personInternalId) return "—";
    const person = personsById.get(personInternalId);
    const name = person
      ? [person.given_name, person.paternal_name, person.maternal_name].filter(Boolean).join(" ")
      : null;
    return name ? `${personInternalId} - ${name}` : personInternalId;
  };

  return (
    <>
      <PageTitle
        title="Órdenes"
        items={[{ label: "Apps" }, { label: "Comercio" }, { label: "Órdenes", active: true }]}
      />
      <div className="mt-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <h2 className="card-title text-2xl">
                <span className="iconify lucide--receipt size-6"></span>
                Órdenes
              </h2>
              <div className="flex flex-wrap gap-2">
                <Link href="/apps/commerce/orders/self-service" className="btn btn-primary btn-sm">
                  <span className="iconify lucide--monitor size-4"></span>
                  Autoservicio
                </Link>
                <Link href="/apps/commerce/orders/operator" className="btn btn-secondary btn-sm">
                  <span className="iconify lucide--user-round size-4"></span>
                  Venta por Operador
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Desde</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered input-sm w-full"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Hasta</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered input-sm w-full"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Estatus</span>
                </label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus | "")}
                >
                  <option value="">Todos</option>
                  {ORDER_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Usuario que levanta la orden</span>
                </label>
                <input
                  type="text"
                  placeholder="ID del usuario"
                  className="input input-bordered input-sm w-full"
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                />
              </div>
              <div className="form-control justify-end">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={clearFilters}
                  disabled={!hasFilters}
                >
                  <span className="iconify lucide--x size-4"></span>
                  Limpiar filtros
                </button>
              </div>
            </div>

            {cancelError && (
              <div className="alert alert-error mb-4">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>{cancelError}</div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner message="Cargando órdenes..." />
              </div>
            ) : error ? (
              <div className="alert alert-error">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>{error}</div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <span className="iconify lucide--receipt size-24 text-base-content/20 mb-4"></span>
                <h3 className="text-xl font-medium text-base-content mb-2">Sin órdenes</h3>
                <p className="text-base-content/60">
                  {hasFilters
                    ? "Ningún pedido coincide con los filtros seleccionados"
                    : "Todavía no se ha registrado ninguna orden"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Orden</th>
                      <th>Fecha</th>
                      <th>Modo</th>
                      <th>Estatus</th>
                      <th>Cliente</th>
                      <th>Recoge</th>
                      <th>Pago</th>
                      <th className="text-right">Total</th>
                      <th>Levantada por</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="font-medium">{order.id_orden}</td>
                        <td className="text-sm text-base-content/60">{formatDateTime(order.created)}</td>
                        <td>
                          <span className="badge badge-ghost badge-sm">{orderModeLabel(order)}</span>
                        </td>
                        <td>
                          <span className={`badge badge-sm ${STATUS_BADGE[order.status ?? "PENDING"]}`}>
                            {ORDER_STATUSES.find((s) => s.value === order.status)?.label ?? order.status}
                          </span>
                        </td>
                        <td>{clientDisplay(order.person_internal_id)}</td>
                        <td>{order.collected_by ?? "—"}</td>
                        <td>
                          {order.payment_method ? PAYMENT_METHOD_LABELS[order.payment_method] : "—"}
                        </td>
                        <td className="text-right font-medium">${Number(order.total).toFixed(2)}</td>
                        <td>{order.created_by_person_internal_id ?? "—"}</td>
                        <td>
                          <div className="flex justify-end gap-1">
                            {isActionable(order.status) ? (
                              <Link
                                href={`/apps/commerce/orders/${order.id}`}
                                className="btn btn-ghost btn-xs"
                                title="Editar"
                              >
                                <span className="iconify lucide--pencil size-4"></span>
                              </Link>
                            ) : (
                              <button type="button" className="btn btn-ghost btn-xs" disabled title="Editar">
                                <span className="iconify lucide--pencil size-4"></span>
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs text-error"
                              title="Cancelar"
                              disabled={!isActionable(order.status)}
                              onClick={() => setCancelTarget(order)}
                            >
                              <span className="iconify lucide--ban size-4"></span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancelar orden"
        message="¿Estás seguro de que deseas cancelar esta orden? Si ya había sido colocada, el inventario se restaurará."
        itemName={cancelTarget ? `Orden #${cancelTarget.id_orden}` : null}
        loading={cancelLoading}
      />
    </>
  );
}
