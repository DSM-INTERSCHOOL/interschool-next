import { PaymentMethod } from "@/interfaces/IOrder";

interface PaymentMethodScreenProps {
  total: number;
  submitting: boolean;
  error: string | null;
  onChoose: (method: PaymentMethod) => void;
}

export function PaymentMethodScreen({ total, submitting, error, onChoose }: PaymentMethodScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-10 bg-base-200 p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold">¿Cómo quieres pagar?</h1>
        <p className="text-xl text-base-content/60">Total a pagar: ${total.toFixed(2)}</p>
      </div>

      {error && (
        <div className="alert alert-error max-w-md">
          <span className="iconify lucide--alert-circle size-5"></span>
          <span>{error}</span>
        </div>
      )}

      <div className="grid w-full max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onChoose("VENTANILLA")}
          disabled={submitting}
          className="card h-auto bg-base-100 p-8 shadow-xl transition hover:scale-105 hover:shadow-2xl active:scale-95 disabled:opacity-50"
        >
          <span className="iconify lucide--store size-16 text-primary"></span>
          <span className="mt-4 text-2xl font-bold">Pago en Ventanilla</span>
          <span className="mt-1 text-base-content/60">Paga en efectivo o tarjeta en el mostrador</span>
        </button>

        <button
          type="button"
          onClick={() => onChoose("SPEI")}
          disabled={submitting}
          className="card h-auto bg-base-100 p-8 shadow-xl transition hover:scale-105 hover:shadow-2xl active:scale-95 disabled:opacity-50"
        >
          <span className="iconify lucide--landmark size-16 text-primary"></span>
          <span className="mt-4 text-2xl font-bold">SPEI</span>
          <span className="mt-1 text-base-content/60">Transferencia bancaria</span>
        </button>
      </div>

      {submitting && <span className="loading loading-spinner loading-lg"></span>}
    </div>
  );
}
