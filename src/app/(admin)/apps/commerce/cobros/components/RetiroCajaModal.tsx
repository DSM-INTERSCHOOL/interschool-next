"use client";

import { useState } from "react";

interface RetiroCajaModalProps {
  availableCash: number;
  loading: boolean;
  error: string | null;
  onSubmit: (amount: number, reason: string) => Promise<boolean>;
  onClose: () => void;
}

export function RetiroCajaModal({ availableCash, loading, error, onSubmit, onClose }: RetiroCajaModalProps) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const numeric = Number(amount || 0);
  const exceedsAvailable = amount !== "" && !Number.isNaN(numeric) && numeric > availableCash;
  const valid = amount !== "" && !Number.isNaN(numeric) && numeric > 0 && !exceedsAvailable;

  const handleSubmit = async () => {
    const ok = await onSubmit(numeric, reason);
    if (ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-base-100 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-base-300 p-6">
          <h2 className="text-xl font-semibold">Retiro de caja</h2>
          <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <span className="iconify lucide--x size-5"></span>
          </button>
        </div>
        <div className="flex flex-col gap-4 p-6">
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">Monto a retirar</span>
            </label>
            <input
              type="text"
              inputMode="decimal"
              className="input input-bordered w-full"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="mt-1 text-xs text-base-content/60">
              Efectivo disponible: <span className="font-medium">${availableCash.toFixed(2)}</span>
            </p>
            {exceedsAvailable && <p className="mt-1 text-sm text-error">El retiro excede el efectivo disponible</p>}
          </div>
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">Motivo</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Ej. Depósito a caja fuerte"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-base-300 p-6">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" disabled={loading || !valid} onClick={handleSubmit}>
            {loading && <span className="loading loading-spinner loading-sm"></span>}
            Registrar retiro
          </button>
        </div>
      </div>
    </div>
  );
}
