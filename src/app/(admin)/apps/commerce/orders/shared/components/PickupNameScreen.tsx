import { useState } from "react";

interface PickupNameScreenProps {
  total: number;
  submitting: boolean;
  error: string | null;
  clientLabel?: string;
  onBack: () => void;
  onSubmit: (pickupName: string) => void;
}

export function PickupNameScreen({
  total,
  submitting,
  error,
  clientLabel,
  onBack,
  onSubmit,
}: PickupNameScreenProps) {
  const [name, setName] = useState("");
  const ready = name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 overflow-y-auto bg-base-200 p-8">
      <button
        type="button"
        onClick={onBack}
        disabled={submitting}
        className="btn btn-ghost absolute left-4 top-4"
      >
        <span className="iconify lucide--arrow-left size-5"></span>
        Regresar
      </button>

      {clientLabel && (
        <div className="badge badge-lg badge-outline absolute right-4 top-4 gap-2 py-4">
          <span className="iconify lucide--user-round size-4"></span>
          Cliente: {clientLabel}
        </div>
      )}

      <div className="flex flex-col items-center gap-2 text-center">
        <span className="iconify lucide--user size-16 text-primary"></span>
        <h1 className="max-w-lg text-3xl font-bold">¿A nombre de quién recogemos tu pedido?</h1>
        <p className="text-xl text-base-content/60">Total: ${total.toFixed(2)}</p>
      </div>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre de quien recoge"
        autoFocus
        className="input input-bordered input-lg h-auto w-full max-w-md rounded-2xl px-6 py-4 text-2xl"
      />

      {error && (
        <div className="alert alert-error max-w-md">
          <span className="iconify lucide--alert-circle size-5"></span>
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => onSubmit(name.trim())}
        disabled={!ready || submitting}
        className="btn btn-primary btn-lg h-auto w-full max-w-md rounded-2xl py-5 text-2xl"
      >
        {submitting ? <span className="loading loading-spinner loading-md"></span> : "Generar Orden"}
      </button>
    </div>
  );
}
