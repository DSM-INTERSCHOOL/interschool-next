import { AppLink as Link } from "@/components/AppLink";
import { PaymentMethod } from "@/interfaces/IOrder";

interface PaymentMethodScreenProps {
  orderId: number;
  total: number;
  submitting: boolean;
  error: string | null;
  clientLabel?: string;
  onChoose: (method: PaymentMethod) => void;
  // null = unknown/no client. The Prepago option only shows once this is a
  // number covering the full total -- paying with wallet balance here is
  // all-or-nothing, not a partial tender like a cashier can split at Cobros.
  walletBalance: number | null;
  onChooseSaldo: () => void;
  // Whether the school has the SPEI vía enabled (Configuración > Medios de
  // pago) -- the button is hidden rather than shown-then-rejected when
  // it's off.
  speiEnabled: boolean;
}

export function PaymentMethodScreen({
  orderId,
  total,
  submitting,
  error,
  clientLabel,
  onChoose,
  walletBalance,
  onChooseSaldo,
  speiEnabled,
}: PaymentMethodScreenProps) {
  const saldoAvailable = walletBalance !== null && walletBalance >= total;
  const visibleCount = 1 + (saldoAvailable ? 1 : 0) + (speiEnabled ? 1 : 0); // Ventanilla always shows
  return (
    <div className="relative flex h-[75vh] min-h-[32rem] w-full flex-col items-center justify-center gap-10 overflow-y-auto rounded-2xl border border-base-300 bg-base-200 p-8">
      {clientLabel && (
        <div className="badge badge-lg badge-outline absolute right-4 top-4 gap-2 py-4">
          <span className="iconify lucide--user-round size-4"></span>
          Cliente: {clientLabel}
        </div>
      )}

      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold">¿Cómo quieres pagar?</h1>
        <p className="text-xl text-base-content/60">Total a pagar: ${total.toFixed(2)}</p>
      </div>

      {error && (
        <div className="alert alert-error max-w-md flex-col items-start gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="iconify lucide--alert-circle size-5"></span>
            <span>{error}</span>
          </div>
          <Link href={`/apps/commerce/orders/${orderId}`} className="btn btn-sm btn-ghost">
            <span className="iconify lucide--pencil size-4"></span>
            Ir a la orden para modificarla
          </Link>
        </div>
      )}

      <div className={`grid w-full max-w-2xl grid-cols-1 gap-6 ${visibleCount >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {saldoAvailable && (
          <button
            type="button"
            onClick={onChooseSaldo}
            disabled={submitting}
            className="card h-auto bg-base-100 p-8 shadow-xl transition hover:scale-105 hover:shadow-2xl active:scale-95 disabled:opacity-50"
          >
            <span className="iconify lucide--wallet size-16 text-primary"></span>
            <span className="mt-4 text-2xl font-bold">Prepago</span>
            <span className="mt-1 text-base-content/60">
              Paga con tu saldo (disponible: ${(walletBalance ?? 0).toFixed(2)})
            </span>
          </button>
        )}

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

        {speiEnabled && (
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
        )}
      </div>

      {submitting && <span className="loading loading-spinner loading-lg"></span>}
    </div>
  );
}
