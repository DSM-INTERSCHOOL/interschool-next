"use client";

import { useState } from "react";
import { AppLink as Link } from "@/components/AppLink";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { CommercePersonRead } from "@/interfaces/ICommercePerson";
import { PendingPaymentRead } from "@/interfaces/ITransaction";
import { usePendingTopups } from "./hooks";

const fullName = (person: CommercePersonRead | undefined, personInternalId: string) => {
  if (!person) return personInternalId;
  const name = [person.given_name, person.paternal_name, person.maternal_name].filter(Boolean).join(" ");
  return name ? `${personInternalId} - ${name}` : personInternalId;
};

// dd/MM/yyyy HH:mm, in the viewer's own local time -- matches OrdersListPage.
const formatDateTime = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function RecargasPendientesPage() {
  const { topups, loading, error, personsById, actionLoadingId, actionError, confirm, cancel, reload } =
    usePendingTopups();
  const [cancelTarget, setCancelTarget] = useState<PendingPaymentRead | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<PendingPaymentRead | null>(null);

  const concepto = (p: PendingPaymentRead) => (p.purpose === "ORDER" ? `Orden #${p.order_id}` : "Recarga de saldo");

  const handleCancel = async () => {
    if (!cancelTarget) return;
    await cancel(cancelTarget.id);
    setCancelTarget(null);
  };

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    await confirm(confirmTarget.id);
    setConfirmTarget(null);
  };

  return (
    <>
      <PageTitle
        title="Pagos Pendientes (SPEI)"
      />

      <div className="mt-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex flex-wrap items-center justify-end gap-4 mb-4">
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                title="Actualizar lista"
                onClick={() => reload()}
                disabled={loading}
              >
                <span className={`iconify lucide--refresh-cw size-4 ${loading ? "animate-spin" : ""}`}></span>
              </button>
              <Link href="/apps/commerce/prepago" className="btn btn-outline btn-sm">
                <span className="iconify lucide--wallet size-4"></span>
                Ir a Prepago
              </Link>
            </div>

            {actionError && (
              <div className="alert alert-error mb-4">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>{actionError}</div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner message="Cargando recargas pendientes..." />
              </div>
            ) : error ? (
              <div className="alert alert-error">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>{error}</div>
              </div>
            ) : topups.length === 0 ? (
              <div className="text-center py-16">
                <span className="iconify lucide--check-circle size-24 text-base-content/20 mb-4"></span>
                <h3 className="text-xl font-medium text-base-content mb-2">Sin pagos pendientes</h3>
                <p className="text-base-content/60">
                  Todas las transferencias SPEI (recargas y órdenes) han sido confirmadas o canceladas
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Concepto</th>
                      <th>Cliente</th>
                      <th className="text-right">Monto</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topups.map((topup) => (
                      <tr key={topup.id}>
                        <td className="text-sm text-base-content/60">{formatDateTime(topup.created)}</td>
                        <td>{concepto(topup)}</td>
                        <td>{fullName(personsById.get(topup.person_internal_id), topup.person_internal_id)}</td>
                        <td className="text-right font-medium">${Number(topup.amount).toFixed(2)}</td>
                        <td>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              disabled={actionLoadingId === topup.id}
                              onClick={() => setConfirmTarget(topup)}
                            >
                              {actionLoadingId === topup.id && (
                                <span className="loading loading-spinner loading-xs"></span>
                              )}
                              Confirmar
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm text-error"
                              disabled={actionLoadingId === topup.id}
                              onClick={() => setCancelTarget(topup)}
                            >
                              Cancelar
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
        title="Cancelar recarga"
        message="¿Estás seguro de que la transferencia SPEI nunca llegó? Esta recarga se cancelará sin afectar el saldo del cliente."
        itemName={cancelTarget ? `$${Number(cancelTarget.amount).toFixed(2)}` : null}
        loading={actionLoadingId === cancelTarget?.id}
      />

      {confirmTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setConfirmTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-base-100 p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="iconify lucide--circle-check-big mx-auto mb-3 size-12 text-success"></span>
            <h2 className="text-xl font-bold">¿Confirmar esta transferencia?</h2>
            <p className="mt-2 text-base-content/60">
              Verifica que la transferencia SPEI de{" "}
              <span className="font-semibold">${Number(confirmTarget.amount).toFixed(2)}</span> por{" "}
              {concepto(confirmTarget).toLowerCase()} ya llegó a la cuenta de la escuela.{" "}
              {confirmTarget.purpose === "ORDER"
                ? "Esto marcará la orden como pagada y generará su recibo."
                : "Esto abonará el monto al saldo del cliente."}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                className="btn btn-lg h-auto w-full rounded-2xl py-3 text-lg"
              >
                Todavía no
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={actionLoadingId === confirmTarget.id}
                className="btn btn-success btn-lg h-auto w-full rounded-2xl py-3 text-lg"
              >
                {actionLoadingId === confirmTarget.id && (
                  <span className="loading loading-spinner loading-sm"></span>
                )}
                Sí, ya llegó
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
