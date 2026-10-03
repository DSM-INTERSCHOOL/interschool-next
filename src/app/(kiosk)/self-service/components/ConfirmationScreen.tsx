import { OrderRead } from "@/interfaces/IOrder";

interface ConfirmationScreenProps {
  order: OrderRead;
  onNewOrder: () => void;
}

export function ConfirmationScreen({ order, onNewOrder }: ConfirmationScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-success to-success/70 p-8 text-center text-success-content">
      <span className="iconify lucide--circle-check-big size-24"></span>
      <h1 className="text-4xl font-bold">¡Gracias por tu orden!</h1>
      <div className="rounded-3xl bg-base-100 px-12 py-6 text-base-content shadow-2xl">
        <p className="text-lg text-base-content/60">Tu número de orden es</p>
        <p className="text-6xl font-bold">#{order.id_orden}</p>
      </div>
      <p className="max-w-sm text-lg opacity-90">
        Dirígete al mostrador para recoger tu pedido cuando sea anunciado.
      </p>
      <button
        type="button"
        onClick={onNewOrder}
        className="btn btn-lg h-auto rounded-3xl bg-base-100 px-12 py-6 text-2xl font-bold text-success shadow-xl"
      >
        Nueva Orden
      </button>
    </div>
  );
}
