"use client";

import { useState } from "react";

interface TerminalNameModalProps {
  deviceId: string;
  loading: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (name: string) => void;
}

// No backdrop dismiss: the screen can't be used without completing this
// step, so the only way out is "Cancelar", which leaves the screen.
export function TerminalNameModal({ deviceId, loading, error, onCancel, onSubmit }: TerminalNameModalProps) {
  const [name, setName] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.3)", backdropFilter: "blur(4px)" }}
    >
      <div className="w-full max-w-md rounded-lg bg-base-100 shadow-xl">
        <div className="border-b border-base-300 p-6">
          <h2 className="text-xl font-semibold">Nombra esta terminal</h2>
          <p className="mt-1 text-sm text-base-content/60">
            Esta terminal (device_id: <span className="font-mono">{deviceId}</span>) no está registrada todavía.
            Dale un nombre corto para identificarla en los cortes de caja.
          </p>
        </div>
        <div className="p-6">
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs">Nombre corto</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Ej. Mostrador 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && name.trim() && onSubmit(name.trim())}
            />
          </div>
          {error && <p className="mt-2 text-sm text-error">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-base-300 p-6">
          <button type="button" className="btn btn-ghost" disabled={loading} onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={loading || !name.trim()}
            onClick={() => onSubmit(name.trim())}
          >
            {loading && <span className="loading loading-spinner loading-sm"></span>}
            Guardar y continuar
          </button>
        </div>
      </div>
    </div>
  );
}
