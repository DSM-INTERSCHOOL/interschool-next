import { CartLine } from "../hooks";

interface CartPanelProps {
  lines: CartLine[];
  total: number;
  onUpdateQuantity: (key: string, quantity: number) => void;
  onRemove: (key: string) => void;
  onCancel: () => void;
  onProceedToPickup: () => void;
}

export function CartPanel({
  lines,
  total,
  onUpdateQuantity,
  onRemove,
  onCancel,
  onProceedToPickup,
}: CartPanelProps) {
  return (
    <div className="flex h-full w-full max-w-sm flex-col border-l border-base-300 bg-base-100">
      <div className="flex items-center justify-between border-b border-base-300 p-4">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <span className="iconify lucide--shopping-cart size-6"></span>
          Tu orden
        </h2>
        <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm text-error">
          Cancelar
        </button>
      </div>

      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-base-content/50">
          <span className="iconify lucide--shopping-cart size-12"></span>
          <p>Toca un artículo para agregarlo</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          <ul className="flex flex-col gap-4">
            {lines.map((line) => (
              <li key={line.key} className="flex gap-3">
                <div className="flex-1">
                  <p className="font-semibold">{line.title}</p>
                  {(line.colorLabel || line.sizeLabel) && (
                    <p className="text-sm text-base-content/60">
                      {[line.colorLabel, line.sizeLabel].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(line.key, line.quantity - 1)}
                      className="btn btn-circle btn-xs"
                    >
                      <span className="iconify lucide--minus size-3"></span>
                    </button>
                    <span className="w-6 text-center font-medium">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(line.key, line.quantity + 1)}
                      className="btn btn-circle btn-xs"
                    >
                      <span className="iconify lucide--plus size-3"></span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(line.key)}
                      className="btn btn-ghost btn-xs ml-auto text-error"
                    >
                      <span className="iconify lucide--trash-2 size-4"></span>
                    </button>
                  </div>
                </div>
                <span className="font-semibold">${(line.unitPrice * line.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-base-300 p-4">
        <div className="mb-4 flex items-center justify-between text-xl font-bold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <button
          type="button"
          onClick={onProceedToPickup}
          disabled={lines.length === 0}
          className="btn btn-primary btn-lg h-auto w-full rounded-2xl py-4 text-xl"
        >
          Finalizar pedido
        </button>
      </div>
    </div>
  );
}
