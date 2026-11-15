"use client";

import { useState } from "react";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ReceiptRead } from "@/interfaces/IReceipt";
import { ReciboDetailModal } from "./components";
import { useRecibosHistorial } from "./hooks";

const formatDateTime = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function RecibosPage() {
  const form = useRecibosHistorial();
  const [selected, setSelected] = useState<ReceiptRead | null>(null);

  const hasFilters = Boolean(form.folio || form.clientPersonInternalId || form.startDate || form.endDate);

  return (
    <>
      <PageTitle
        title="Recibos"
      />

      <div className="mt-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body gap-4!">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Folio</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ej. 102"
                  className="input input-bordered input-sm w-full"
                  value={form.folio}
                  onChange={(e) => form.setFolio(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Cliente (ID)</span>
                </label>
                <input
                  type="text"
                  placeholder="ID del cliente"
                  className="input input-bordered input-sm w-full"
                  value={form.clientPersonInternalId}
                  onChange={(e) => form.setClientPersonInternalId(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Desde</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered input-sm w-full"
                  value={form.startDate}
                  onChange={(e) => form.setStartDate(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Hasta</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered input-sm w-full"
                  value={form.endDate}
                  onChange={(e) => form.setEndDate(e.target.value)}
                />
              </div>
              <div className="form-control justify-end">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={form.clearFilters}
                  disabled={!hasFilters}
                >
                  <span className="iconify lucide--x size-4"></span>
                  Limpiar filtros
                </button>
              </div>
            </div>

            {form.loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner message="Cargando recibos..." />
              </div>
            ) : form.error ? (
              <div className="alert alert-error">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>{form.error}</div>
              </div>
            ) : form.receipts.length === 0 ? (
              <div className="py-16 text-center">
                <span className="iconify lucide--receipt-text size-24 text-base-content/20 mb-4"></span>
                <h3 className="mb-2 text-xl font-medium text-base-content">Sin recibos</h3>
                <p className="text-base-content/60">
                  {hasFilters ? "Ningún recibo coincide con los filtros seleccionados" : "Todavía no se ha generado ningún recibo"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Folio</th>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Orden</th>
                      <th className="text-right">Total</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.receipts.map((receipt) => (
                      <tr key={receipt.id}>
                        <td className="font-medium">{receipt.folio}</td>
                        <td>{receipt.client_name}</td>
                        <td className="text-sm text-base-content/60">{formatDateTime(receipt.created)}</td>
                        <td className="text-sm text-base-content/60">#{receipt.order_id}</td>
                        <td className="text-right font-medium">${Number(receipt.total).toFixed(2)}</td>
                        <td>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              title="Ver recibo"
                              onClick={() => setSelected(receipt)}
                            >
                              <span className="iconify lucide--eye size-4"></span>
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

      {selected && <ReciboDetailModal receiptId={selected.id} onClose={() => setSelected(null)} />}
    </>
  );
}
