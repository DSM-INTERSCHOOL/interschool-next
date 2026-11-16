import { useCallback, useEffect, useMemo, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { CfdiRead } from "@/interfaces/ICfdi";
import { getCfdiList } from "@/services/cfdi.service";

const DEBOUNCE_MS = 300;

const toDateInputValue = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// No explicit range picked yet -> default to the current month, so the
// screen never loads the entire, ever-growing invoice history by default.
const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: toDateInputValue(start), end: toDateInputValue(end) };
};

const buildFilters = (orderId: string, rfc: string, estatus: string, startDate: string, endDate: string) => {
  const clauses: string[] = [];
  if (orderId.trim()) clauses.push(`order_id::eq::${orderId.trim()}`);
  if (rfc.trim()) clauses.push(`rfc::eq::${rfc.trim().toUpperCase()}`);
  if (estatus) clauses.push(`estatus::eq::${estatus}`);
  if (startDate) clauses.push(`created::gte::${startDate}T00:00:00`);
  if (endDate) clauses.push(`created::lte::${endDate}T23:59:59`);
  return clauses.join(",");
};

export const useFacturasHistorial = () => {
  const defaultRange = useMemo(getCurrentMonthRange, []);
  const [orderId, setOrderId] = useState("");
  const [rfc, setRfc] = useState("");
  const [estatus, setEstatus] = useState("");
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [cfdis, setCfdis] = useState<CfdiRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const filters = buildFilters(orderId, rfc, estatus, startDate, endDate);
      const data = await getCfdiList({ schoolId, filters: filters || undefined });
      setCfdis(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al cargar las facturas");
    } finally {
      setLoading(false);
    }
  }, [orderId, rfc, estatus, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(load, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [load]);

  const clearFilters = () => {
    setOrderId("");
    setRfc("");
    setEstatus("");
    setStartDate(defaultRange.start);
    setEndDate(defaultRange.end);
  };

  const hasFilters =
    Boolean(orderId || rfc || estatus) || startDate !== defaultRange.start || endDate !== defaultRange.end;

  return {
    cfdis,
    loading,
    error,
    orderId,
    setOrderId,
    rfc,
    setRfc,
    estatus,
    setEstatus,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    hasFilters,
    clearFilters,
    reload: load,
  };
};
