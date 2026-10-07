import { useCallback, useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { OrderRead, OrderStatus } from "@/interfaces/IOrder";
import { CommercePersonRead } from "@/interfaces/ICommercePerson";
import { getOrders } from "@/services/order.service";
import { getCommercePersons } from "@/services/commercePerson.service";

const DEBOUNCE_MS = 300;

const buildFilters = (status: OrderStatus | "", createdBy: string, startDate: string, endDate: string) => {
  const clauses: string[] = [];
  if (status) clauses.push(`status::eq::${status}`);
  if (createdBy.trim()) clauses.push(`created_by_person_internal_id::eq::${createdBy.trim()}`);
  // Inclusive of the whole end day, not just up to its midnight.
  if (startDate) clauses.push(`created::gte::${startDate}T00:00:00`);
  if (endDate) clauses.push(`created::lte::${endDate}T23:59:59`);
  return clauses.join(",");
};

export const useOrdersList = () => {
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [createdBy, setCreatedBy] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orders, setOrders] = useState<OrderRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personsById, setPersonsById] = useState<Map<string, CommercePersonRead>>(new Map());

  // Fetched once, not re-fetched per filter change -- just a lookup for
  // displaying a client's name next to their id in the table.
  useEffect(() => {
    const { schoolId } = getOrgConfig();
    getCommercePersons({ schoolId })
      .then((persons) => setPersonsById(new Map(persons.map((p) => [p.person_internal_id, p]))))
      .catch(() => {
        // Non-critical: the table still shows the id if the name lookup fails.
      });
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const filters = buildFilters(status, createdBy, startDate, endDate);
      const data = await getOrders({ schoolId, filters: filters || undefined });
      setOrders(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al cargar las órdenes");
    } finally {
      setLoading(false);
    }
  }, [status, createdBy, startDate, endDate]);

  // Debounced: filter changes (especially typing in createdBy) shouldn't
  // fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(load, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [load]);

  const clearFilters = () => {
    setStatus("");
    setCreatedBy("");
    setStartDate("");
    setEndDate("");
  };

  return {
    orders,
    loading,
    error,
    personsById,
    status,
    setStatus,
    createdBy,
    setCreatedBy,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    clearFilters,
    // Immediate, undebounced re-fetch with the current filters -- for
    // refreshing the list after an action like cancelling an order.
    reload: load,
  };
};
