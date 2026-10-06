import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { OrderRead, OrderStatus } from "@/interfaces/IOrder";
import { getOrders } from "@/services/order.service";

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

  useEffect(() => {
    const timer = setTimeout(() => {
      const load = async () => {
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
      };
      load();
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [status, createdBy, startDate, endDate]);

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
    status,
    setStatus,
    createdBy,
    setCreatedBy,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    clearFilters,
  };
};
