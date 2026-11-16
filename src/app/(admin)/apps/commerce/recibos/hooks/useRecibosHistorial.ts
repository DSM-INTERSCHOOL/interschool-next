import { useCallback, useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { ReceiptRead } from "@/interfaces/IReceipt";
import { getReceipts } from "@/services/receipt.service";

const DEBOUNCE_MS = 300;

const todayLocalDate = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

const buildFilters = (folio: string, clientPersonInternalId: string, startDate: string, endDate: string) => {
  const clauses: string[] = [];
  if (folio.trim()) clauses.push(`folio::eq::${folio.trim()}`);
  if (clientPersonInternalId.trim()) clauses.push(`client_person_internal_id::eq::${clientPersonInternalId.trim()}`);
  if (startDate) clauses.push(`created::gte::${startDate}T00:00:00`);
  if (endDate) clauses.push(`created::lte::${endDate}T23:59:59`);
  return clauses.join(",");
};

export const useRecibosHistorial = () => {
  const [folio, setFolio] = useState("");
  const [clientPersonInternalId, setClientPersonInternalId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [receipts, setReceipts] = useState<ReceiptRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const filters = buildFilters(folio, clientPersonInternalId, startDate, endDate);
      const data = await getReceipts({ schoolId, filters: filters || undefined });
      setReceipts(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al cargar los recibos");
    } finally {
      setLoading(false);
    }
  }, [folio, clientPersonInternalId, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(load, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [load]);

  const clearFilters = () => {
    setFolio("");
    setClientPersonInternalId("");
    setStartDate("");
    setEndDate("");
  };

  return {
    receipts,
    loading,
    error,
    folio,
    setFolio,
    clientPersonInternalId,
    setClientPersonInternalId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    clearFilters,
    reload: load,
  };
};
