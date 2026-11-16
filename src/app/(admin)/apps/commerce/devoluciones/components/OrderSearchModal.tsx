import { useEffect, useMemo, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { ORDER_STATUSES, OrderRead, OrderStatus } from "@/interfaces/IOrder";
import { CommercePersonRead } from "@/interfaces/ICommercePerson";
import { getOrders } from "@/services/order.service";

interface OrderSearchModalProps {
  personsById: Map<string, CommercePersonRead>;
  onSelect: (order: OrderRead) => void;
  onClose: () => void;
}

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "badge-ghost",
  PLACED: "badge-info",
  PARTIALLY_DISPATCHED: "badge-warning",
  COMPLETED: "badge-success",
  PAID: "badge-success",
  CANCELLED: "badge-error",
};

// Paid and not cancelled -- devoluciones/cambios only apply to a pedido
// pagado y entregado; status beyond "paid" (PAID/PARTIALLY_DISPATCHED/
// COMPLETED) doesn't further restrict here since a return only needs
// *some* dispatched quantity to exist on at least one line, which the
// backend itself validates per-line.
export function OrderSearchModal({ personsById, onSelect, onClose }: OrderSearchModalProps) {
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<OrderRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { schoolId } = getOrgConfig();
    getOrders({ schoolId, filters: "paid::eq::true" })
      .then((data) => setOrders(data.filter((o) => o.status !== "CANCELLED")))
      .catch((err: any) => {
        setError(err.response?.data?.detail || err.message || "Error al cargar las órdenes");
      })
      .finally(() => setLoading(false));
  }, []);

  const clientDisplay = (personInternalId: string | null) => {
    if (!personInternalId) return "—";
    const person = personsById.get(personInternalId);
    const name = person
      ? [person.given_name, person.paternal_name, person.maternal_name].filter(Boolean).join(" ")
      : null;
    return name ? `${personInternalId} - ${name}` : personInternalId;
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((order) => {
      if (String(order.id_orden).includes(term)) return true;
      if (order.person_internal_id?.toLowerCase().includes(term)) return true;
      return clientDisplay(order.person_internal_id).toLowerCase().includes(term);
    });
  }, [orders, search, personsById]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-base-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-base-300 p-4">
          <h2 className="text-lg font-bold">Buscar orden</h2>
          <button type="button" onClick={onClose} className="btn btn-circle btn-ghost btn-sm">
            <span className="iconify lucide--x size-5"></span>
          </button>
        </div>

        <div className="p-4 pb-0">
          <input
            type="text"
            autoFocus
            placeholder="Número de orden o cliente..."
            className="input input-bordered w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <span className="iconify lucide--alert-circle size-5"></span>
              <span>{error}</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-base-content/60">Sin órdenes pagadas</div>
          ) : (
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Estatus</th>
                  <th>Cliente</th>
                  <th className="text-right">Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="cursor-pointer hover" onClick={() => onSelect(order)}>
                    <td className="font-medium">{order.id_orden}</td>
                    <td>
                      <span className={`badge badge-sm ${STATUS_BADGE[order.status ?? "PENDING"]}`}>
                        {ORDER_STATUSES.find((s) => s.value === order.status)?.label ?? order.status}
                      </span>
                    </td>
                    <td>{clientDisplay(order.person_internal_id)}</td>
                    <td className="text-right font-medium">${Number(order.total).toFixed(2)}</td>
                    <td>
                      <button type="button" className="btn btn-primary btn-xs">
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
