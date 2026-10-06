import { PaymentInstructionsRead } from "@/interfaces/IOrder";

interface ConfirmationScreenProps {
  instructions: PaymentInstructionsRead;
  onNewOrder: () => void;
}

export function ConfirmationScreen({ instructions, onNewOrder }: ConfirmationScreenProps) {
  return (
    <div className="flex h-[75vh] min-h-[32rem] w-full flex-col items-center justify-center gap-6 overflow-y-auto rounded-2xl bg-gradient-to-br from-success to-success/70 p-8 text-center text-success-content">
      <span className="iconify lucide--circle-check-big size-24"></span>
      <h1 className="text-4xl font-bold">¡Gracias por tu orden!</h1>

      <div className="flex flex-col items-center gap-4 rounded-3xl bg-base-100 px-12 py-6 text-base-content shadow-2xl">
        <div>
          <p className="text-lg text-base-content/60">Tu número de orden es</p>
          <p className="text-6xl font-bold">#{instructions.id_orden}</p>
        </div>
        <p className="text-2xl font-semibold">Total: ${Number(instructions.total).toFixed(2)}</p>

        {instructions.clabe && (
          <div className="w-full rounded-2xl bg-base-200 px-6 py-4">
            <p className="text-sm text-base-content/60">CLABE interbancaria</p>
            <p className="text-2xl font-bold tracking-wider">{instructions.clabe}</p>
          </div>
        )}
      </div>

      <p className="max-w-sm text-lg opacity-90">{instructions.message}</p>

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
