import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { useAuthStore } from "@/store/useAuthStore";
import { RecargaSpeiInstructions } from "@/interfaces/ITransaction";
import { getMisRecargasSpei, getRecargaSpeiDisponible, solicitarRecargaSpei } from "@/services/transaction.service";
import { getCommercePerson } from "@/services/commercePerson.service";

// Self-service SPEI top-up: the buyer only generates the deposit
// instruction here. The balance is credited later by staff from Recargas
// pendientes, once the transfer actually arrives.
export const useRecargarSaldo = () => {
  const personInternalId = useAuthStore((state) => state.personInternalId);

  const [balance, setBalance] = useState<number | null>(null);
  const [pending, setPending] = useState<RecargaSpeiInstructions[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  // SPEI channel enabled AND a CLABE to deposit to (CLABE única or the
  // buyer's own). Optimistic while loading; the server re-checks anyway
  // when the instruction is requested.
  const [speiEnabled, setSpeiEnabled] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<RecargaSpeiInstructions | null>(null);

  const load = async () => {
    const { schoolId } = getOrgConfig();
    try {
      setLoading(true);
      setLoadError(null);
      const [list, person] = await Promise.all([
        getMisRecargasSpei({ schoolId }),
        personInternalId ? getCommercePerson({ schoolId, personInternalId }) : Promise.resolve(null),
      ]);
      setPending(list);
      setBalance(person ? Number(person.balance) : null);
    } catch (err: any) {
      setLoadError(err.response?.data?.detail || err.message || "No se pudo cargar tu saldo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const { schoolId } = getOrgConfig();
    getRecargaSpeiDisponible({ schoolId })
      .then(setSpeiEnabled)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personInternalId]);

  const solicitar = async (amount: number) => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      const { schoolId } = getOrgConfig();
      const result = await solicitarRecargaSpei({ schoolId, dto: { amount } });
      setInstructions(result);
      setPending((prev) =>
        prev.some((p) => p.order_payment_id === result.order_payment_id) ? prev : [result, ...prev]
      );
    } catch (err: any) {
      setSubmitError(err.response?.data?.detail || err.message || "No se pudo generar la instrucción SPEI");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    balance,
    pending,
    loading,
    loadError,
    speiEnabled,
    submitting,
    submitError,
    instructions,
    solicitar,
    showInstructions: setInstructions,
    closeInstructions: () => setInstructions(null),
    refresh: load,
  };
};
