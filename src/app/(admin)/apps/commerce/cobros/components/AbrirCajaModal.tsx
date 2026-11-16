"use client";

import { useState } from "react";

interface AbrirCajaModalProps {
  loading: boolean;
  error: string | null;
  onSubmit: (openingAmount: number, notes: string) => void;
}

// Blocking (no close button, no backdrop dismiss) -- collecting a payment
// on this terminal requires an open cash register, enforced server-side on
// every cobro/devolución/recarga, so there's no useful "cancel" here either.
export function AbrirCajaModal({ loading, error, onSubmit }: AbrirCajaModalProps) {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const numeric = Number(amount || 0);
  const valid = amount !== "" && !Number.isNaN(numeric) && numeric >= 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", backdropFilter: "blur(4px)" }}
    >
      <div className="w-full max-w-md rounded-lg bg-base-100 shadow-xl">
        <div className="border-b border-base-300 p-6">
          <h2 className="text-xl font-semibold">Abrir caja</h2>
          <p className="mt-1 text-sm text-base-content/60">
            Captura el efectivo inicial para comenzar a cobrar en esta terminal.
          </p>
        </div>
        <div className="flex flex-col gap-4 p-6">
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">Monto inicial en efectivo</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              className="input input-bordered w-full"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
          {error && <p className="text-sm text-error">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-base-300 p-6">
          <button
            type="button"
            className="btn btn-primary"
            disabled={loading || !valid}
            onClick={() => onSubmit(numeric, notes)}
          >
            {loading && <span className="loading loading-spinner loading-sm"></span>}
            Abrir caja
          </button>
        </div>
      </div>
    </div>
  );
}
