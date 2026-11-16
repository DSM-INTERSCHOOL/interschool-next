import { useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { CommercePersonRead } from "@/interfaces/ICommercePerson";
import { TenderMethod } from "@/interfaces/ITransaction";
import { recargarSaldo } from "@/services/transaction.service";
import { useEnabledPaymentMethods } from "../../hooks/useEnabledPaymentMethods";

const round2 = (n: number) => Math.round(n * 100) / 100;

export interface TopupTenderEntry {
  id: string;
  method: TenderMethod;
  amount: number;
}

// Unlike Cobros' tenders (which pay down a known order total), a top-up has
// no target to cap against -- the amount credited is whatever the cashier
// enters per tender. EFECTIVO has no separate "cash given / change" split
// here (that only matters when paying toward a fixed total); the entered
// amount is exactly what gets credited.
export const usePrepago = (onTopup: () => void) => {
  // Which top-up buttons to offer -- Configuración can disable a "forma de
  // pago" or the SPEI "vía" school-wide, and recargar_saldo already
  // rejects a disabled one server-side (ensure_enabled), but nothing was
  // filtering this button list itself.
  const { visibleTopupTenderMethods } = useEnabledPaymentMethods();

  const [selectedPerson, setSelectedPerson] = useState<CommercePersonRead | null>(null);
  const [tenders, setTenders] = useState<TopupTenderEntry[]>([]);
  const [addMethod, setAddMethod] = useState<TenderMethod | "">("");
  const [addAmount, setAddAmount] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectPerson = (person: CommercePersonRead) => {
    setSelectedPerson(person);
    setTenders([]);
    setAddMethod("");
    setAddAmount("");
    setAddError(null);
    setConfirmError(null);
    setSuccessMessage(null);
  };

  const reset = () => {
    setSelectedPerson(null);
    setTenders([]);
    setAddMethod("");
    setAddAmount("");
    setAddError(null);
    setConfirmError(null);
  };

  const pickAddMethod = (method: TenderMethod) => {
    setAddMethod(method);
    setAddError(null);
  };

  const addTender = () => {
    if (!addMethod) return;
    const amount = Number(addAmount);
    if (!addAmount || Number.isNaN(amount) || amount <= 0) {
      setAddError("Ingresa un monto válido");
      return;
    }
    setTenders((prev) => [...prev, { id: crypto.randomUUID(), method: addMethod, amount }]);
    setAddMethod("");
    setAddAmount("");
    setAddError(null);
  };

  const removeTender = (id: string) => {
    setTenders((prev) => prev.filter((t) => t.id !== id));
  };

  const total = round2(tenders.reduce((sum, t) => sum + t.amount, 0));
  const immediateTotal = round2(
    tenders.filter((t) => t.method !== "SPEI").reduce((sum, t) => sum + t.amount, 0)
  );
  const pendingTotal = round2(total - immediateTotal);

  const canConfirm = selectedPerson !== null && tenders.length > 0 && !confirmLoading;

  const confirmTopup = async () => {
    if (!selectedPerson || tenders.length === 0) return;
    try {
      setConfirmLoading(true);
      setConfirmError(null);
      const { schoolId } = getOrgConfig();
      const result = await recargarSaldo({
        schoolId,
        dto: {
          person_internal_id: selectedPerson.person_internal_id,
          payments: tenders.map((t) => ({ payment_method: t.method, amount: t.amount, cambio: 0 })),
        },
      });

      const parts: string[] = [];
      if (immediateTotal > 0) parts.push(`$${immediateTotal.toFixed(2)} abonados de inmediato`);
      if (pendingTotal > 0) parts.push(`$${pendingTotal.toFixed(2)} pendientes de confirmar (SPEI)`);
      setSuccessMessage(`Recarga registrada: ${parts.join(", ")}`);

      setSelectedPerson((prev) =>
        prev && result.new_balance !== null ? { ...prev, balance: result.new_balance } : prev
      );
      setTenders([]);
      onTopup();
    } catch (err: any) {
      setConfirmError(err.response?.data?.detail || err.message || "No se pudo registrar la recarga");
    } finally {
      setConfirmLoading(false);
    }
  };

  return {
    selectedPerson,
    selectPerson,
    reset,
    tenders,
    visibleTopupTenderMethods,
    addMethod,
    pickAddMethod,
    addAmount,
    setAddAmount,
    addError,
    addTender,
    removeTender,
    total,
    immediateTotal,
    pendingTotal,
    canConfirm,
    confirmLoading,
    confirmError,
    successMessage,
    confirmTopup,
  };
};
