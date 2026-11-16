import { PaymentConfirmation } from "@/interfaces/IOrder";

interface ConfirmationScreenProps {
  instructions: PaymentConfirmation;
  onNewOrder: () => void;
}

export function ConfirmationScreen({ instructions, onNewOrder }: ConfirmationScreenProps) {
  return (
    <div className="flex h-[75vh] min-h-[32rem] w-full flex-col items-center justify-center gap-3 overflow-y-auto rounded-2xl bg-gradient-to-br from-success to-success/70 p-6 text-center text-success-content">
      <span className="iconify lucide--circle-check-big size-14"></span>
      <h1 className="text-2xl font-bold">¡Gracias por tu orden!</h1>

      <div className="flex flex-col items-center gap-2 rounded-3xl bg-base-100 px-8 py-5 text-base-content shadow-2xl">
        <div>
          <p className="text-sm text-base-content/60">Tu número de orden es</p>
          <p className="text-4xl font-bold">#{instructions.id_orden}</p>
        </div>
        <p className="text-lg font-semibold">Total: ${Number(instructions.total).toFixed(2)}</p>

        {/* The instructions always lead into the account data below them
            (when there is any) -- e.g. "Realiza tu transferencia SPEI a la
            siguiente cuenta." reads naturally right before the CLABE, not
            after it. */}
        <p className="max-w-sm text-sm text-base-content/70">{instructions.message}</p>

        {instructions.clabe && (
          <div className="w-full rounded-2xl bg-base-200 px-6 py-3">
            {instructions.bank && <p className="text-sm text-base-content/60">Banco: {instructions.bank}</p>}
            <p className="text-sm text-base-content/60">CLABE interbancaria</p>
            <p className="text-xl font-bold tracking-wider">{instructions.clabe}</p>
            {instructions.owner_name && (
              <p className="text-sm text-base-content/60">Titular: {instructions.owner_name}</p>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onNewOrder}
        className="btn h-auto rounded-3xl bg-base-100 px-8 py-3 text-lg font-bold text-success shadow-xl"
      >
        Nueva Orden
      </button>
    </div>
  );
}
