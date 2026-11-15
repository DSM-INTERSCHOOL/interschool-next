import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { CashRegisterSessionSummary } from "@/interfaces/ICashRegister";
import { abrirCaja, cerrarCaja, getCajaActual, getResumenCajaActual } from "@/services/cashRegister.service";

// Apertura/acumulado/corte for the caller's own terminal (x-device-id is
// attached automatically by commerceApi, same header the backend already
// trusts for session verification) -- so this hook never has to know or ask
// for a device_id itself.
export const useCajaForm = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<CashRegisterSessionSummary | null>(null);

  const [openingAmount, setOpeningAmount] = useState("");
  const [openingNotes, setOpeningNotes] = useState("");
  const [openLoading, setOpenLoading] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);

  const [countedAmount, setCountedAmount] = useState("");
  const [closingNotes, setClosingNotes] = useState("");
  const [closeLoading, setCloseLoading] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);

  // The just-closed corte, shown as a receipt until the user starts a new
  // session -- set once and never refetched, since it's a frozen snapshot.
  const [closedSummary, setClosedSummary] = useState<CashRegisterSessionSummary | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const current = await getCajaActual({ schoolId });
      if (!current) {
        setSummary(null);
        return;
      }
      const resumen = await getResumenCajaActual({ schoolId });
      setSummary(resumen);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "No se pudo cargar el estado de la caja");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrir = async () => {
    const numeric = Number(openingAmount || 0);
    if (Number.isNaN(numeric) || numeric < 0) {
      setOpenError("El monto inicial debe ser un número válido");
      return;
    }
    try {
      setOpenLoading(true);
      setOpenError(null);
      const { schoolId } = getOrgConfig();
      await abrirCaja({ schoolId, dto: { opening_amount: numeric, notes: openingNotes || undefined } });
      setOpeningAmount("");
      setOpeningNotes("");
      setClosedSummary(null);
      await load();
    } catch (err: any) {
      setOpenError(err.response?.data?.detail || err.message || "No se pudo abrir la caja");
    } finally {
      setOpenLoading(false);
    }
  };

  const cerrar = async () => {
    const numeric = Number(countedAmount || 0);
    if (Number.isNaN(numeric) || numeric < 0) {
      setCloseError("El monto contado debe ser un número válido");
      return;
    }
    try {
      setCloseLoading(true);
      setCloseError(null);
      const { schoolId } = getOrgConfig();
      const result = await cerrarCaja({ schoolId, dto: { counted_amount: numeric, notes: closingNotes || undefined } });
      setClosedSummary(result);
      setCountedAmount("");
      setClosingNotes("");
      setSummary(null);
    } catch (err: any) {
      setCloseError(err.response?.data?.detail || err.message || "No se pudo cerrar la caja");
    } finally {
      setCloseLoading(false);
    }
  };

  const refresh = () => load();

  return {
    loading,
    error,
    summary,
    openingAmount,
    setOpeningAmount,
    openingNotes,
    setOpeningNotes,
    openLoading,
    openError,
    abrir,
    countedAmount,
    setCountedAmount,
    closingNotes,
    setClosingNotes,
    closeLoading,
    closeError,
    cerrar,
    closedSummary,
    refresh,
  };
};
