import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { getDeviceId } from "@/lib/deviceId";
import { CashRegisterSessionSummary } from "@/interfaces/ICashRegister";
import { abrirCaja, cerrarCaja, getCajaActual, getResumenCajaActual, retirarCaja } from "@/services/cashRegister.service";
import { createTerminal, getTerminals } from "@/services/terminal.service";

// Gates the Cobros screen behind an open cash-register session for this
// terminal (device_id) -- collecting a payment requires one open already
// (enforced server-side on every realizar-pago/devolver-pedidos/etc.
// call), so this surfaces that requirement up front instead of letting the
// cashier build up a payment only to have confirmation fail. If the
// terminal has never been named (apps/commerce/caja/terminales), it's
// registered inline with a short name before the "abrir caja" step.
export const useCajaGate = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [needsTerminalName, setNeedsTerminalName] = useState(false);
  const [needsOpen, setNeedsOpen] = useState(false);
  const [summary, setSummary] = useState<CashRegisterSessionSummary | null>(null);

  const [terminalLoading, setTerminalLoading] = useState(false);
  const [terminalError, setTerminalError] = useState<string | null>(null);

  const [openLoading, setOpenLoading] = useState(false);
  const [openError, setOpenError] = useState<string | null>(null);

  const [retiroLoading, setRetiroLoading] = useState(false);
  const [retiroError, setRetiroError] = useState<string | null>(null);

  const [closeLoading, setCloseLoading] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [closedSummary, setClosedSummary] = useState<CashRegisterSessionSummary | null>(null);

  const check = async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const current = await getCajaActual({ schoolId });
      if (!current) {
        const deviceId = getDeviceId();
        const terminals = await getTerminals({ schoolId });
        const registered = terminals.some((t) => t.device_id === deviceId);
        setNeedsTerminalName(!registered);
        setNeedsOpen(true);
        setSummary(null);
        return;
      }
      setNeedsTerminalName(false);
      setNeedsOpen(false);
      const resumen = await getResumenCajaActual({ schoolId });
      setSummary(resumen);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "No se pudo verificar el estado de la caja");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const registerTerminal = async (name: string) => {
    try {
      setTerminalLoading(true);
      setTerminalError(null);
      const { schoolId } = getOrgConfig();
      await createTerminal({ schoolId, dto: { device_id: getDeviceId(), name } });
      setNeedsTerminalName(false);
    } catch (err: any) {
      setTerminalError(err.response?.data?.detail || err.message || "No se pudo registrar la terminal");
    } finally {
      setTerminalLoading(false);
    }
  };

  const abrir = async (openingAmount: number, notes: string) => {
    try {
      setOpenLoading(true);
      setOpenError(null);
      const { schoolId } = getOrgConfig();
      await abrirCaja({ schoolId, dto: { opening_amount: openingAmount, notes: notes || undefined } });
      setClosedSummary(null);
      await check();
    } catch (err: any) {
      setOpenError(err.response?.data?.detail || err.message || "No se pudo abrir la caja");
    } finally {
      setOpenLoading(false);
    }
  };

  const retirar = async (amount: number, reason: string): Promise<boolean> => {
    try {
      setRetiroLoading(true);
      setRetiroError(null);
      const { schoolId } = getOrgConfig();
      const result = await retirarCaja({ schoolId, dto: { amount, reason: reason || undefined } });
      setSummary(result);
      return true;
    } catch (err: any) {
      setRetiroError(err.response?.data?.detail || err.message || "No se pudo registrar el retiro");
      return false;
    } finally {
      setRetiroLoading(false);
    }
  };

  const cerrar = async (countedAmount: number, notes: string): Promise<boolean> => {
    try {
      setCloseLoading(true);
      setCloseError(null);
      const { schoolId } = getOrgConfig();
      const result = await cerrarCaja({ schoolId, dto: { counted_amount: countedAmount, notes: notes || undefined } });
      setClosedSummary(result);
      return true;
    } catch (err: any) {
      setCloseError(err.response?.data?.detail || err.message || "No se pudo cerrar la caja");
      return false;
    } finally {
      setCloseLoading(false);
    }
  };

  // Called when the corte receipt is dismissed -- re-checks, which will
  // now correctly report needsOpen=true for the next shift.
  const finishCorte = async () => {
    setClosedSummary(null);
    await check();
  };

  return {
    loading,
    error,
    deviceId: getDeviceId(),
    needsTerminalName,
    needsOpen,
    isReady: !loading && !error && !needsTerminalName && !needsOpen,
    summary,
    terminalLoading,
    terminalError,
    registerTerminal,
    openLoading,
    openError,
    abrir,
    retiroLoading,
    retiroError,
    retirar,
    closeLoading,
    closeError,
    cerrar,
    closedSummary,
    finishCorte,
    refresh: check,
  };
};
