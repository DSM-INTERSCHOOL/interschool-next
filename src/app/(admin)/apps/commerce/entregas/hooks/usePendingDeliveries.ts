import { useCallback, useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { DISPATCHABLE_STATUSES, OrderRead } from "@/interfaces/IOrder";
import { CommercePersonRead } from "@/interfaces/ICommercePerson";
import { getOrders } from "@/services/order.service";
import { getCommercePersons } from "@/services/commercePerson.service";

// Backs both the always-visible "pendientes de entrega" panel and the order
// search modal -- orders that are paid but don't yet have every line fully
// dispatched. Mutually exclusive with Cobros' pending-payment set: an order
// is either not yet paid (shown there) or paid (shown here), never both.
export const usePendingDeliveries = () => {
  const [orders, setOrders] = useState<OrderRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personsById, setPersonsById] = useState<Map<string, CommercePersonRead>>(new Map());

  useEffect(() => {
    const { schoolId } = getOrgConfig();
    getCommercePersons({ schoolId })
      .then((persons) => setPersonsById(new Map(persons.map((p) => [p.person_internal_id, p]))))
      .catch(() => {
        // Non-critical: the list still shows the id if the name lookup fails.
      });
  }, []);

  // `silent` skips the loading spinner -- used by the background
  // auto-refresh so the list doesn't flash every minute; the manual
  // refresh button still goes through the normal (non-silent) path.
  const load = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      // paid::eq::true is the authoritative "already paid" condition;
      // status::in::[PAID;PARTIALLY_DISPATCHED] additionally keeps
      // COMPLETED (nothing left to deliver) out. Comma separates distinct
      // filter clauses (ANDed); the "in" operator's own value uses [a;b;c].
      const filters = `paid::eq::true,status::in::[${DISPATCHABLE_STATUSES.join(";")}]`;
      const data = await getOrders({ schoolId, filters });
      setOrders(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al cargar las órdenes pendientes de entrega");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const interval = setInterval(() => load(true), 60_000);
    return () => clearInterval(interval);
  }, [load]);

  return { orders, loading, error, personsById, reload: load };
};
