import { OrderRead } from "@/interfaces/IOrder";

const formatDateTime = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const Divider = ({ solid = false }: { solid?: boolean }) => (
  <div className={`border-t ${solid ? "border-base-content" : "border-dashed border-base-content/40"}`} />
);

interface OrdenTicketViewProps {
  order: OrderRead;
  clientName: string | null;
}

// Thermal-printer ticket (80mm) of an order -- same look as ReciboView
// (apps/commerce/recibos) but without the cobro: no folio, no tenders, no
// amount in words. It's an order ticket (e.g. for preparing/handing it
// over), not proof of payment. Built from the order as it is now, unlike
// the receipt, which is a snapshot taken when it was paid.
export function OrdenTicketView({ order, clientName }: OrdenTicketViewProps) {
  return (
    <div className="text-base-content mx-auto box-border flex w-[80mm] flex-col gap-2 p-2 font-mono text-xs">
      <div className="flex flex-col items-center gap-0.5 text-center">
        <p className="text-sm font-bold">ORDEN</p>
        <p className="text-lg font-bold">#{order.id_orden}</p>
        <p>{formatDateTime(order.created)}</p>
      </div>

      <Divider />

      <p className="truncate">Cliente: {clientName || "PUBLICO EN GENERAL"}</p>
      {order.collected_by && <p className="truncate">Recoge: {order.collected_by}</p>}

      <Divider />

      <div className="flex flex-col gap-1.5">
        {order.details.map((item) => (
          <div key={item.id}>
            <p>
              {item.product_title ?? `Producto ${item.product_id}`}
              {(item.color || item.size) && <span> ({[item.color, item.size].filter(Boolean).join("/")})</span>}
            </p>
            <div className="flex justify-between">
              <span>
                {item.amount} x ${(Number(item.price) - Number(item.unit_discount)).toFixed(2)}
              </span>
              <span>${Number(item.total).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <Divider solid />

      <div className="flex justify-between text-sm font-bold">
        <span>TOTAL</span>
        <span>${Number(order.total).toFixed(2)}</span>
      </div>

      <Divider />

      <p className="text-center">¡Gracias por su compra!</p>
    </div>
  );
}
