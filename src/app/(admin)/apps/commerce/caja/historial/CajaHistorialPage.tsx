"use client";

import { useState } from "react";
import { PageTitle } from "@/components/PageTitle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CashRegisterSessionRead } from "@/interfaces/ICashRegister";
import { formatDateTime } from "../components";
import { useTerminalNames } from "../hooks";
import { CorteDetailModal } from "./components";
import { useCajaHistorial } from "./hooks";

const STATUS_BADGE: Record<string, string> = {
  OPEN: "badge-warning",
  CLOSED: "badge-success",
};

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Abierta",
  CLOSED: "Cerrada",
};

export default function CajaHistorialPage() {
  const form = useCajaHistorial();
  const { resolveTerminalName } = useTerminalNames();
  const [selected, setSelected] = useState<CashRegisterSessionRead | null>(null);

  const hasFilters = Boolean(form.deviceId || form.openedBy || form.status || form.startDate || form.endDate);

  return (
    <>
      <PageTitle
        title="Historial de Caja"
      />

      <div className="mt-6">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body gap-4!">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Terminal</span>
                </label>
                <input
                  type="text"
                  placeholder="device_id"
                  className="input input-bordered input-sm w-full"
                  value={form.deviceId}
                  onChange={(e) => form.setDeviceId(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Usuario que abrió</span>
                </label>
                <input
                  type="text"
                  placeholder="ID del usuario"
                  className="input input-bordered input-sm w-full"
                  value={form.openedBy}
                  onChange={(e) => form.setOpenedBy(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Estatus</span>
                </label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={form.status}
                  onChange={(e) => form.setStatus(e.target.value as "OPEN" | "CLOSED" | "")}
                >
                  <option value="">Todos</option>
                  <option value="OPEN">Abierta</option>
                  <option value="CLOSED">Cerrada</option>
                </select>
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
                <LoadingSpinner message="Cargando historial..." />
              </div>
            ) : form.error ? (
              <div className="alert alert-error">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>{form.error}</div>
              </div>
            ) : form.sessions.length === 0 ? (
              <div className="py-16 text-center">
                <span className="iconify lucide--landmark size-24 text-base-content/20 mb-4"></span>
                <h3 className="mb-2 text-xl font-medium text-base-content">Sin cortes</h3>
                <p className="text-base-content/60">
                  {hasFilters ? "Ningún corte coincide con los filtros seleccionados" : "Todavía no se ha registrado ningún corte"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Terminal</th>
                      <th>Abierta por</th>
                      <th>Apertura</th>
                      <th>Cierre</th>
                      <th>Estatus</th>
                      <th className="text-right">Monto inicial</th>
                      <th className="text-right">Esperado</th>
                      <th className="text-right">Contado</th>
                      <th className="text-right">Diferencia</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.sessions.map((session) => (
                      <tr key={session.id}>
                        <td className="font-medium">
                          {resolveTerminalName(session.device_id)}
                          {resolveTerminalName(session.device_id) !== session.device_id && (
                            <span className="block text-xs font-normal text-base-content/50">{session.device_id}</span>
                          )}
                        </td>
                        <td>{session.opened_by_person_internal_id}</td>
                        <td className="text-sm text-base-content/60">{formatDateTime(session.opened_at)}</td>
                        <td className="text-sm text-base-content/60">{formatDateTime(session.closed_at)}</td>
                        <td>
                          <span className={`badge badge-sm ${STATUS_BADGE[session.status]}`}>
                            {STATUS_LABEL[session.status]}
                          </span>
                        </td>
                        <td className="text-right">${Number(session.opening_amount).toFixed(2)}</td>
                        <td className="text-right">
                          {session.expected_cash_amount !== null ? `$${Number(session.expected_cash_amount).toFixed(2)}` : "—"}
                        </td>
                        <td className="text-right">
                          {session.closing_counted_amount !== null ? `$${Number(session.closing_counted_amount).toFixed(2)}` : "—"}
                        </td>
                        <td
                          className={`text-right font-medium ${
                            session.cash_difference === null
                              ? ""
                              : Number(session.cash_difference) === 0
                                ? ""
                                : Number(session.cash_difference) > 0
                                  ? "text-success"
                                  : "text-error"
                          }`}
                        >
                          {session.cash_difference !== null ? `$${Number(session.cash_difference).toFixed(2)}` : "—"}
                        </td>
                        <td>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              title="Ver detalle"
                              onClick={() => setSelected(session)}
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

      {selected && (
        <CorteDetailModal
          sessionId={selected.id}
          resolveTerminalName={resolveTerminalName}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
