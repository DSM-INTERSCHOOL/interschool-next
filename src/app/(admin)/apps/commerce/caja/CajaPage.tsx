"use client";

import { AppLink as Link } from "@/components/AppLink";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CobrosPorFormaPago, CorteTotals, SessionHeader } from "./components";
import { useCajaForm, useTerminalNames } from "./hooks";

export default function CajaPage() {
  const form = useCajaForm();
  const { resolveTerminalName } = useTerminalNames();

  return (
    <>
      <PageTitle title="Caja" />

      <div className="mt-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body gap-5!">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <div className="flex gap-2">
                <Link href="/apps/commerce/caja/terminales" className="btn btn-outline btn-sm">
                  <span className="iconify lucide--monitor-smartphone size-4"></span>
                  Terminales
                </Link>
                <Link href="/apps/commerce/caja/historial" className="btn btn-outline btn-sm">
                  <span className="iconify lucide--history size-4"></span>
                  Historial de cortes
                </Link>
              </div>
            </div>

            {form.loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner message="Cargando caja..." />
              </div>
            ) : form.error ? (
              <div className="alert alert-error">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>{form.error}</div>
              </div>
            ) : form.summary ? (
              <>
                <SessionHeader summary={form.summary} resolveTerminalName={resolveTerminalName} />

                <CobrosPorFormaPago summary={form.summary} />

                <CorteTotals summary={form.summary} />

                <div className="rounded-xl border border-base-300 p-4">
                  <p className="mb-2 font-semibold">Corte de caja</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text text-xs">Efectivo contado</span>
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        className="input input-bordered w-full"
                        value={form.countedAmount}
                        onChange={(e) => form.setCountedAmount(e.target.value)}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text text-xs">Notas (opcional)</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={form.closingNotes}
                        onChange={(e) => form.setClosingNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  {form.countedAmount !== "" && !Number.isNaN(Number(form.countedAmount)) && (
                    <p className="mt-2 text-sm text-base-content/70">
                      Diferencia estimada:{" "}
                      <span
                        className={
                          Number(form.countedAmount) - Number(form.summary.expected_cash) === 0
                            ? "font-medium"
                            : Number(form.countedAmount) - Number(form.summary.expected_cash) > 0
                              ? "font-medium text-success"
                              : "font-medium text-error"
                        }
                      >
                        ${(Number(form.countedAmount) - Number(form.summary.expected_cash)).toFixed(2)}
                      </span>
                    </p>
                  )}
                  {form.closeError && <p className="mt-2 text-sm text-error">{form.closeError}</p>}
                  <div className="card-actions mt-4 justify-end">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={form.refresh}>
                      <span className="iconify lucide--refresh-cw size-4"></span>
                      Actualizar
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={form.closeLoading || form.countedAmount === ""}
                      onClick={form.cerrar}
                    >
                      {form.closeLoading && <span className="loading loading-spinner loading-sm"></span>}
                      Cerrar caja
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {form.closedSummary && (
                  <div className="rounded-xl border border-success/40 bg-success/5 p-4">
                    <p className="mb-2 font-semibold">Corte registrado</p>
                    <SessionHeader summary={form.closedSummary} resolveTerminalName={resolveTerminalName} />
                    <div className="mt-4">
                      <CobrosPorFormaPago summary={form.closedSummary} />
                    </div>
                    <div className="mt-4">
                      <CorteTotals summary={form.closedSummary} />
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-base-300 p-4">
                  <p className="mb-2 font-semibold">Abrir caja</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text text-xs">Monto inicial en efectivo</span>
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        className="input input-bordered w-full"
                        value={form.openingAmount}
                        onChange={(e) => form.setOpeningAmount(e.target.value)}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text text-xs">Notas (opcional)</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={form.openingNotes}
                        onChange={(e) => form.setOpeningNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  {form.openError && <p className="mt-2 text-sm text-error">{form.openError}</p>}
                  <div className="card-actions mt-4 justify-end">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={form.openLoading || form.openingAmount === ""}
                      onClick={form.abrir}
                    >
                      {form.openLoading && <span className="loading loading-spinner loading-sm"></span>}
                      Abrir caja
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
