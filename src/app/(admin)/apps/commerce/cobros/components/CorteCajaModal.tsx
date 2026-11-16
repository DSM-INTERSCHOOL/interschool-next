"use client";

import { useState } from "react";
import { CashRegisterSessionSummary } from "@/interfaces/ICashRegister";
import { CobrosPorFormaPago, CorteTotals, SessionHeader } from "../../caja/components";

interface CorteCajaModalProps {
  summary: CashRegisterSessionSummary;
  closedSummary: CashRegisterSessionSummary | null;
  loading: boolean;
  error: string | null;
  resolveTerminalName?: (deviceId: string) => string;
  onSubmit: (countedAmount: number, notes: string) => Promise<boolean>;
  onClose: () => void;
}

export function CorteCajaModal({
  summary,
  closedSummary,
  loading,
  error,
  resolveTerminalName,
  onSubmit,
  onClose,
}: CorteCajaModalProps) {
  const [counted, setCounted] = useState("");
  const [notes, setNotes] = useState("");
  const numeric = Number(counted || 0);
  const valid = counted !== "" && !Number.isNaN(numeric) && numeric >= 0;

  const display = closedSummary ?? summary;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", backdropFilter: "blur(4px)" }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-base-100 shadow-xl">
        <div className="flex items-center justify-between border-b border-base-300 p-6">
          <h2 className="text-xl font-semibold">{closedSummary ? "Corte registrado" : "Corte de caja"}</h2>
          {closedSummary ? null : (
            <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
              <span className="iconify lucide--x size-5"></span>
            </button>
          )}
        </div>
        <div className="flex flex-col gap-4 p-6">
          <SessionHeader summary={display} resolveTerminalName={resolveTerminalName} />
          <CobrosPorFormaPago summary={display} />
          <CorteTotals summary={display} />

          {!closedSummary && (
            <div className="rounded-xl border border-base-300 p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs">Efectivo contado</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="input input-bordered w-full"
                    value={counted}
                    onChange={(e) => setCounted(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs">Notas (opcional)</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              {error && <p className="mt-2 text-sm text-error">{error}</p>}
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" className="btn btn-ghost" onClick={onClose}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={loading || !valid}
                  onClick={() => onSubmit(numeric, notes)}
                >
                  {loading && <span className="loading loading-spinner loading-sm"></span>}
                  Cerrar caja
                </button>
              </div>
            </div>
          )}
          {closedSummary && (
            <div className="flex justify-end">
              <button type="button" className="btn btn-primary" onClick={onClose}>
                Entendido
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
