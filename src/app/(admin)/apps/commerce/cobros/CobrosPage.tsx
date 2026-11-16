"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ORDER_STATUSES, OrderRead, OrderStatus } from "@/interfaces/IOrder";
import { TENDER_METHODS } from "@/interfaces/ITransaction";
import { useTerminalNames } from "../caja/hooks";
import { ReciboDetailModal } from "../recibos/components";
import { useCajaGate, useCobros, usePendingOrders } from "./hooks";
import {
  AbrirCajaModal,
  CorteCajaModal,
  OrderDetailModal,
  OrderSearchModal,
  RetiroCajaModal,
  TerminalNameModal,
} from "./components";

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "badge-ghost",
  PLACED: "badge-info",
  PARTIALLY_DISPATCHED: "badge-warning",
  COMPLETED: "badge-success",
  PAID: "badge-success",
  CANCELLED: "badge-error",
};

// SALDO isn't one of the selectable TENDER_METHODS buttons (it's rendered
// separately, gated on the order having a client with balance) but still
// needs a label once it's in the tenders table.
const tenderLabel = (method: string) =>
  method === "SALDO" ? "Saldo" : TENDER_METHODS.find((m) => m.value === method)?.label ?? method;

// dd/MM/yyyy, in the viewer's own local time -- date only, this is just an
// informative label on the pending-orders list, not the detailed
// dd/MM/yyyy HH:mm shown in OrderDetailModal/OrdersListPage.
const formatDate = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

export default function CobrosPage() {
  const pending = usePendingOrders();
  const caja = useCajaGate();
  // A payment changes both the pending-orders list and the open session's
  // totals (what "Corte de caja" shows) -- refresh both, or the corte modal
  // keeps showing pre-payment numbers until a full page reload.
  const cobros = useCobros(() => {
    pending.reload();
    caja.refresh();
  }, pending.personsById);
  const { resolveTerminalName } = useTerminalNames();
  const [searchOpen, setSearchOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<OrderRead | null>(null);
  const [retiroOpen, setRetiroOpen] = useState(false);
  const [corteOpen, setCorteOpen] = useState(false);
  const [receiptModalId, setReceiptModalId] = useState<number | null>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Leaving the gate modals: back to wherever the cashier came from, or to
  // the orders list when the page was opened directly (no history to go
  // back to).
  const leaveCobros = () => {
    if (window.history.length > 1) router.back();
    else router.push("/apps/commerce/orders");
  };

  useEffect(() => {
    if (cobros.addMethod) amountInputRef.current?.focus();
  }, [cobros.addMethod]);

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
    cobros.selectOrder(order);
    setSearchOpen(false);
  };

  // Collecting a payment on this terminal requires an open cash register
  // (enforced server-side on every realizar-pago/devolver-pedidos/etc.
  // call) -- gate the whole screen behind naming the terminal (first time
  // only) and opening one, instead of letting the cashier build up a
  // payment only to have confirmation fail at the end.
  if (caja.loading) {
    return <LoadingSpinner message="Verificando caja..." />;
  }

  if (caja.error) {
    return (
      <div className="alert alert-error">
        <span className="iconify lucide--alert-circle size-6"></span>
        <div>{caja.error}</div>
      </div>
    );
  }

  if (caja.needsTerminalName) {
    return (
      <TerminalNameModal
        deviceId={caja.deviceId}
        loading={caja.terminalLoading}
        error={caja.terminalError}
        onCancel={leaveCobros}
        onSubmit={caja.registerTerminal}
      />
    );
  }

  if (caja.needsOpen) {
    return (
      <AbrirCajaModal
        loading={caja.openLoading}
        error={caja.openError}
        onCancel={leaveCobros}
        onSubmit={caja.abrir}
      />
    );
  }

  return (
    <>
      <PageTitle title="Cobros" />

      <div className="mt-6 flex justify-end gap-2">
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setRetiroOpen(true)}>
          <span className="iconify lucide--banknote size-4"></span>
          Retiro de caja
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => setCorteOpen(true)}>
          <span className="iconify lucide--landmark size-4"></span>
          Corte de caja
        </button>
      </div>

      {cobros.successMessage && (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3">
          <div className="alert alert-success flex-col items-start gap-2 shadow-lg sm:flex-row sm:items-center lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="iconify lucide--check-circle size-5"></span>
              <span>{cobros.successMessage}</span>
            </div>
            {cobros.lastReceipt && (
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={() => setReceiptModalId(cobros.lastReceipt!.id)}
              >
                <span className="iconify lucide--receipt-text size-4"></span>
                Ver recibo #{cobros.lastReceipt.folio}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                  value={cobros.orderNumber}
                  onChange={(e) => cobros.setOrderNumber(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && cobros.lookupByNumber()}
                />
                <button
                  type="button"
                  className="btn btn-primary join-item"
                  disabled={cobros.lookupLoading}
                  onClick={cobros.lookupByNumber}
                >
                  {cobros.lookupLoading ? (
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
              {cobros.lookupError && <p className="mt-1 text-sm text-error">{cobros.lookupError}</p>}
            </div>

            {cobros.selectedOrder && (
              <>
                <div className="rounded-xl border border-base-300 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <p className="text-sm text-base-content/60">Orden</p>
                      <p className="text-xl font-bold">{cobros.selectedOrder.id_orden}</p>
                    </div>
                    <span className={`badge ${STATUS_BADGE[cobros.selectedOrder.status ?? "PENDING"]}`}>
                      {ORDER_STATUSES.find((s) => s.value === cobros.selectedOrder!.status)?.label ??
                        cobros.selectedOrder.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-base-content/60">Cliente: {clientDisplay(cobros.selectedOrder)}</p>
                    <p className="w-28 text-right text-2xl font-bold tabular-nums">${cobros.total.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-base-200 px-4 py-2">
                  <span className="text-sm text-base-content/70">Restante por cobrar</span>
                  <span
                    className={`w-28 text-right text-2xl font-bold tabular-nums ${cobros.remaining > 0 ? "text-error" : "text-success"}`}
                  >
                    ${cobros.remaining.toFixed(2)}
                  </span>
                </div>

                {cobros.remaining > 0 && (
                  <div role="tablist" className="tabs tabs-boxed w-fit">
                    <button
                      type="button"
                      role="tab"
                      className={`tab ${cobros.activeTab === "tender" ? "tab-active" : ""}`}
                      onClick={() => cobros.setActiveTab("tender")}
                    >
                      Agregar forma de pago
                    </button>
                    <button
                      type="button"
                      role="tab"
                      className={`tab ${cobros.activeTab === "spei" ? "tab-active" : ""}`}
                      disabled={cobros.tenders.length > 0}
                      title={cobros.tenders.length > 0 ? "Quita las formas de pago ya agregadas para usar SPEI" : undefined}
                      onClick={() => cobros.setActiveTab("spei")}
                    >
                      SPEI
                    </button>
                  </div>
                )}

                {cobros.remaining > 0 && cobros.activeTab === "tender" && (
                  <div className="rounded-xl border border-base-300 p-4">
                    <p className="mb-2 font-semibold">Agregar forma de pago</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {cobros.visibleTenderMethods.map((m) => (
                        <button
                          key={m.value}
                          type="button"
                          className={`btn btn-sm ${cobros.addMethod === m.value ? "btn-primary" : "btn-outline"}`}
                          onClick={() => cobros.pickAddMethod(m.value)}
                        >
                          {m.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        className={`btn btn-sm ${cobros.addMethod === "SALDO" ? "btn-primary" : "btn-outline"}`}
                        disabled={!cobros.saldoAvailable}
                        title={
                          cobros.customerBalance === null
                            ? "La orden no tiene un cliente asociado"
                            : !cobros.saldoAvailable
                              ? "El cliente no tiene saldo disponible"
                              : undefined
                        }
                        onClick={() => cobros.pickAddMethod("SALDO")}
                      >
                        Saldo
                      </button>
                      {cobros.customerBalance !== null && (
                        <span className="text-xs text-base-content/60">
                          Saldo del cliente: ${cobros.customerBalance.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {cobros.addMethod && (
                      <div className="mt-3 flex flex-wrap items-end gap-2">
                        <div className="form-control">
                          <label className="label py-1">
                            <span className="label-text text-xs">
                              {cobros.addMethod === "EFECTIVO" ? "Efectivo recibido" : "Monto"}
                            </span>
                          </label>
                          <input
                            ref={amountInputRef}
                            type="text"
                            inputMode="decimal"
                            className="input input-bordered input-sm w-40"
                            value={cobros.addAmount}
                            onChange={(e) => cobros.setAddAmount(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && cobros.addTender()}
                          />
                        </div>
                        <button type="button" className="btn btn-primary btn-sm" onClick={cobros.addTender}>
                          Agregar
                        </button>
                      </div>
                    )}
                    {cobros.addError && <p className="mt-1 text-sm text-error">{cobros.addError}</p>}
                  </div>
                )}

                {cobros.remaining > 0 && cobros.activeTab === "spei" && (
                  <div className="rounded-xl border border-base-300 p-4">
                    {!cobros.speiEnabled ? (
                      <p className="text-sm text-base-content/60">
                        La escuela no tiene habilitado el medio de pago SPEI.
                      </p>
                    ) : !cobros.speiInstructions ? (
                      <>
                        <p className="mb-3 text-sm text-base-content/60">
                          Genera la referencia y la cuenta bancaria para que el cliente realice su transferencia.
                          La orden quedará pendiente de confirmación en Pagos Pendientes (SPEI) hasta que la
                          transferencia se registre.
                        </p>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={cobros.speiLoading}
                          onClick={cobros.requestSpeiInstructions}
                        >
                          {cobros.speiLoading && <span className="loading loading-spinner loading-sm"></span>}
                          Generar datos SPEI
                        </button>
                        {cobros.speiError && <p className="mt-2 text-sm text-error">{cobros.speiError}</p>}
                      </>
                    ) : (
                      <div className="flex flex-col items-start gap-2">
                        <p className="text-sm text-base-content/70">{cobros.speiInstructions.message}</p>
                        <div className="w-full rounded-2xl bg-base-200 px-6 py-3">
                          <p className="text-sm text-base-content/60">Referencia</p>
                          <p className="text-xl font-bold tracking-wider">Orden #{cobros.speiInstructions.id_orden}</p>
                          {cobros.speiInstructions.clabe && (
                            <>
                              {cobros.speiInstructions.bank && (
                                <p className="mt-2 text-sm text-base-content/60">
                                  Banco: {cobros.speiInstructions.bank}
                                </p>
                              )}
                              <p className="text-sm text-base-content/60">CLABE interbancaria</p>
                              <p className="text-xl font-bold tracking-wider">{cobros.speiInstructions.clabe}</p>
                              {cobros.speiInstructions.owner_name && (
                                <p className="text-sm text-base-content/60">
                                  Titular: {cobros.speiInstructions.owner_name}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                        <p className="text-xs text-base-content/50">
                          Esta orden quedó registrada con un pago SPEI pendiente de confirmación.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {cobros.activeTab === "tender" && cobros.tenders.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="table table-sm w-full">
                      <thead>
                        <tr>
                          <th>Forma de pago</th>
                          <th className="text-right">Aplicado</th>
                          <th className="text-right">Cambio</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cobros.tenders.map((t) => (
                          <tr key={t.id}>
                            <td>{tenderLabel(t.method)}</td>
                            <td className="text-right">${t.amountApplied.toFixed(2)}</td>
                            <td className="text-right">{t.change > 0 ? `$${t.change.toFixed(2)}` : "—"}</td>
                            <td className="text-right">
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs text-error"
                                onClick={() => cobros.removeTender(t.id)}
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

                {cobros.activeTab === "tender" && cobros.totalChange > 0 && (
                  <div className="flex items-center justify-between rounded-lg bg-success/10 px-4 py-2">
                    <span className="text-sm text-base-content/70">Cambio total a entregar</span>
                    <span className="text-lg font-bold text-success">${cobros.totalChange.toFixed(2)}</span>
                  </div>
                )}

                {cobros.confirmError && (
                  <div className="alert alert-error">
                    <span className="iconify lucide--alert-circle size-5"></span>
                    <span>{cobros.confirmError}</span>
                  </div>
                )}

                <div className="card-actions justify-end">
                  <button type="button" className="btn btn-ghost" onClick={cobros.reset}>
                    Cancelar
                  </button>
                  {cobros.activeTab === "tender" && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={!cobros.canConfirm}
                      onClick={cobros.confirmPayment}
                    >
                      {cobros.confirmLoading && <span className="loading loading-spinner loading-sm"></span>}
                      Registrar cobro
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h3 className="card-title text-lg">
                <span className="iconify lucide--clock size-5"></span>
                Pendientes de pago
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
              <p className="py-6 text-center text-sm text-base-content/60">No hay órdenes pendientes de pago</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {pending.orders.map((order) => (
                  <li key={order.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      className="flex w-full items-center justify-between rounded-lg border border-base-300 p-3 text-left hover:bg-base-200"
                      onClick={() => cobros.selectOrder(order)}
                      onKeyDown={(e) => e.key === "Enter" && cobros.selectOrder(order)}
                    >
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs px-1"
                          title="Ver detalle"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailOrder(order);
                          }}
                        >
                          <span className="iconify lucide--eye size-4"></span>
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">Orden {order.id_orden}</p>
                            {formatDate(order.created) && (
                              <span className="badge badge-ghost badge-xs">{formatDate(order.created)}</span>
                            )}
                          </div>
                          <p className="text-xs text-base-content/60">{clientDisplay(order)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${Number(order.total).toFixed(2)}</p>
                        <span className={`badge badge-xs ${STATUS_BADGE[order.status ?? "PENDING"]}`}>
                          {ORDER_STATUSES.find((s) => s.value === order.status)?.label ?? order.status}
                        </span>
                      </div>
                    </div>
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

      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          personsById={pending.personsById}
          onClose={() => setDetailOrder(null)}
        />
      )}

      {retiroOpen && caja.summary && (
        <RetiroCajaModal
          availableCash={Number(caja.summary.expected_cash)}
          loading={caja.retiroLoading}
          error={caja.retiroError}
          onSubmit={caja.retirar}
          onClose={() => setRetiroOpen(false)}
        />
      )}

      {corteOpen && caja.summary && (
        <CorteCajaModal
          summary={caja.summary}
          closedSummary={caja.closedSummary}
          loading={caja.closeLoading}
          error={caja.closeError}
          resolveTerminalName={resolveTerminalName}
          onSubmit={caja.cerrar}
          onClose={async () => {
            setCorteOpen(false);
            if (caja.closedSummary) {
              await caja.finishCorte();
            }
          }}
        />
      )}

      {receiptModalId !== null && (
        <ReciboDetailModal
          receiptId={receiptModalId}
          orderNumber={cobros.lastReceipt?.orderNumber}
          autoPrint
          onClose={() => setReceiptModalId(null)}
        />
      )}
    </>
  );
}
