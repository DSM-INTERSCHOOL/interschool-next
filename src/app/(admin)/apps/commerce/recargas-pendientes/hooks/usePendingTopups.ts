import { useCallback, useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { CommercePersonRead } from "@/interfaces/ICommercePerson";
import { PendingPaymentRead } from "@/interfaces/ITransaction";
import { getCommercePersons } from "@/services/commercePerson.service";
import {
  cancelarPagoPendiente,
  confirmarPagoPendiente,
  getPendingPayments,
} from "@/services/transaction.service";

// Same screen, same actions for both: a wallet recharge awaiting SPEI
// confirmation, and an order placed via the SPEI checkout vía awaiting the
// same thing -- see TransactionsService.list_pending_payments.
export const usePendingTopups = () => {
  const [topups, setTopups] = useState<PendingPaymentRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personsById, setPersonsById] = useState<Map<string, CommercePersonRead>>(new Map());
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const { schoolId } = getOrgConfig();
    getCommercePersons({ schoolId })
      .then((persons) => setPersonsById(new Map(persons.map((p) => [p.person_internal_id, p]))))
      .catch(() => {
        // Non-critical: the list still shows the id if the name lookup fails.
      });
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const data = await getPendingPayments({ schoolId, status: "PENDING" });
      setTopups(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al cargar los pagos pendientes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const confirm = async (orderPaymentId: number) => {
    try {
      setActionLoadingId(orderPaymentId);
      setActionError(null);
      const { schoolId } = getOrgConfig();
      await confirmarPagoPendiente({ schoolId, orderPaymentId });
      await load();
    } catch (err: any) {
      setActionError(err.response?.data?.detail || err.message || "No se pudo confirmar el pago");
    } finally {
      setActionLoadingId(null);
    }
  };

  const cancel = async (orderPaymentId: number) => {
    try {
      setActionLoadingId(orderPaymentId);
      setActionError(null);
      const { schoolId } = getOrgConfig();
      await cancelarPagoPendiente({ schoolId, orderPaymentId });
      await load();
    } catch (err: any) {
      setActionError(err.response?.data?.detail || err.message || "No se pudo cancelar el pago");
    } finally {
      setActionLoadingId(null);
    }
  };

  return { topups, loading, error, personsById, actionLoadingId, actionError, confirm, cancel, reload: load };
};
