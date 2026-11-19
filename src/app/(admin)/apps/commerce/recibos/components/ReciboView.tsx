import { ReceiptRead } from "@/interfaces/IReceipt";
import { PAYMENT_METHOD_LABELS } from "../../caja/components";

const formatDateTime = (value: string | null) => {
  if (!value) return { fecha: "—", hora: "—" };
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    fecha: `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`,
    hora: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
};

const Divider = ({ solid = false }: { solid?: boolean }) => (
  <div className={`border-t ${solid ? "border-base-content" : "border-dashed border-base-content/40"}`} />
);

interface ReciboViewProps {
  receipt: ReceiptRead;
  // The order's human-facing id_orden, when the caller already has it on
  // hand (e.g. Cobros just paid that exact order) -- falls back to the
  // receipt's own internal order_id otherwise (still unambiguous, just not
  // the number shown elsewhere in the app for this order).
  orderNumber?: number;
}

// Sized and styled like an actual thermal receipt-printer ticket (80mm
// roll, ~302px at screen resolution) rather than a web page -- monospace,
// narrow, dashed-line section breaks instead of tables/borders, so what's
// previewed on screen is a close match for what prints. The print media
// query in src/styles/custom/print.css sets the physical @page size to
// match; this component just needs to fit that width both on screen and
// on paper.
export function ReciboView({ receipt, orderNumber }: ReciboViewProps) {
  const { fecha, hora } = formatDateTime(receipt.created);

  return (
    <div className="mx-auto box-border flex w-[80mm] flex-col gap-2 p-2 font-mono text-xs text-base-content">
      <div className="flex flex-col items-center gap-0.5 text-center">
        <p className="text-sm font-bold">RECIBO DE PAGO</p>
        <p className="text-lg font-bold">Folio {receipt.folio}</p>
        <p>Orden {orderNumber ?? receipt.order_id}</p>
        <p>
          {fecha} {hora}
        </p>
      </div>

      <Divider />

      <p className="truncate">Cliente: {receipt.client_name}</p>
      {receipt.collected_by && <p className="truncate">Recoge: {receipt.collected_by}</p>}

      <Divider />

      <div className="flex flex-col gap-1.5">
        {receipt.items.map((item, i) => (
          <div key={i}>
            <p>
              {item.title}
              {(item.color || item.size) && <span> ({[item.color, item.size].filter(Boolean).join("/")})</span>}
            </p>
            <div className="flex justify-between">
              <span>
                {item.quantity} x ${Number(item.unit_price).toFixed(2)}
              </span>
              <span>${Number(item.subtotal).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <Divider />

      <div className="flex flex-col gap-0.5">
        {receipt.payments.map((p, i) => (
          <div key={i} className="flex justify-between">
            <span>
              {PAYMENT_METHOD_LABELS[p.payment_method] ?? p.payment_method}
              {p.reference && <span className="text-base-content/60"> (ref. {p.reference})</span>}
            </span>
            <span>${Number(p.amount).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <Divider solid />

      <div className="flex justify-between text-sm font-bold">
        <span>TOTAL</span>
        <span>${Number(receipt.total).toFixed(2)}</span>
      </div>
      <p className="text-center">{receipt.total_in_words}</p>

      <Divider />

      <p className="text-center">¡Gracias por su compra!</p>
    </div>
  );
}
