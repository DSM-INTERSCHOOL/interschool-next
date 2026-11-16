import { useCallback, useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { CashRegisterSessionRead, CashRegisterSessionStatus } from "@/interfaces/ICashRegister";
import { getCajaSessions } from "@/services/cashRegister.service";

const DEBOUNCE_MS = 300;

const todayLocalDate = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

const buildFilters = (
  deviceId: string,
  openedBy: string,
  status: CashRegisterSessionStatus | "",
  startDate: string,
  endDate: string
) => {
  const clauses: string[] = [];
  if (deviceId.trim()) clauses.push(`device_id::eq::${deviceId.trim()}`);
  if (openedBy.trim()) clauses.push(`opened_by_person_internal_id::eq::${openedBy.trim()}`);
  if (status) clauses.push(`status::eq::${status}`);
  // Inclusive of the whole end day, not just up to its midnight.
  if (startDate) clauses.push(`opened_at::gte::${startDate}T00:00:00`);
  if (endDate) clauses.push(`opened_at::lte::${endDate}T23:59:59`);
  return clauses.join(",");
};

export const useCajaHistorial = () => {
  const [deviceId, setDeviceId] = useState("");
  const [openedBy, setOpenedBy] = useState("");
  const [status, setStatus] = useState<CashRegisterSessionStatus | "">("");
  const [startDate, setStartDate] = useState(todayLocalDate);
  const [endDate, setEndDate] = useState(todayLocalDate);
  const [sessions, setSessions] = useState<CashRegisterSessionRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const filters = buildFilters(deviceId, openedBy, status, startDate, endDate);
      const data = await getCajaSessions({ schoolId, filters: filters || undefined });
      setSessions(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al cargar el historial de caja");
    } finally {
      setLoading(false);
    }
  }, [deviceId, openedBy, status, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(load, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [load]);

  const clearFilters = () => {
    setDeviceId("");
    setOpenedBy("");
    setStatus("");
    setStartDate(todayLocalDate());
    setEndDate(todayLocalDate());
  };

  return {
    sessions,
    loading,
    error,
    deviceId,
    setDeviceId,
    openedBy,
    setOpenedBy,
    status,
    setStatus,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    clearFilters,
    reload: load,
  };
};
