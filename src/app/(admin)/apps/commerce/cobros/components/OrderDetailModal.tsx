import { ORDER_STATUSES, OrderRead, OrderStatus } from "@/interfaces/IOrder";
import { CommercePersonRead } from "@/interfaces/ICommercePerson";

interface OrderDetailModalProps {
  order: OrderRead;
  personsById: Map<string, CommercePersonRead>;
  onClose: () => void;
}

// dd/MM/yyyy HH:mm, in the viewer's own local time -- matches OrdersListPage.
const formatDateTime = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "badge-ghost",
  PLACED: "badge-info",
  PARTIALLY_DISPATCHED: "badge-warning",
  COMPLETED: "badge-success",
  PAID: "badge-success",
  CANCELLED: "badge-error",
};

export function OrderDetailModal({ order, personsById, onClose }: OrderDetailModalProps) {
  const clientDisplay = (personInternalId: string | null) => {
    if (!personInternalId) return "—";
    const person = personsById.get(personInternalId);
    const name = person
      ? [person.given_name, person.paternal_name, person.maternal_name].filter(Boolean).join(" ")
      : null;
    return name ? `${personInternalId} - ${name}` : personInternalId;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-base-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-base-300 p-4">
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-bold">Orden {order.id_orden}</h2>
            <span className={`badge badge-sm ${STATUS_BADGE[order.status ?? "PENDING"]}`}>
              {ORDER_STATUSES.find((s) => s.value === order.status)?.label ?? order.status}
            </span>
          </div>
          <button type="button" onClick={onClose} className="btn btn-circle btn-ghost btn-sm">
            <span className="iconify lucide--x size-5"></span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-base-content/70">Cliente: {clientDisplay(order.person_internal_id)}</p>
          <p className="mb-4 text-sm text-base-content/70">Fecha: {formatDateTime(order.created)}</p>

          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Color</th>
                <th>Talla</th>
                <th className="text-right">Cantidad</th>
                <th className="text-right">Precio</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.details.map((detail) => (
                <tr key={detail.id}>
                  <td>{detail.product_title ?? `Producto #${detail.product_id}`}</td>
                  <td>{detail.color ?? "—"}</td>
                  <td>{detail.size ?? "—"}</td>
                  <td className="text-right">{detail.amount}</td>
                  <td className="text-right">${Number(detail.price).toFixed(2)}</td>
                  <td className="text-right font-medium">${Number(detail.total).toFixed(2)}</td>
                </tr>
              ))}
              {order.details.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-base-content/50 py-6">
                    Sin artículos
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} className="text-right text-lg font-bold">
                  Total
                </td>
                <td className="text-right text-lg font-bold">${Number(order.total).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
