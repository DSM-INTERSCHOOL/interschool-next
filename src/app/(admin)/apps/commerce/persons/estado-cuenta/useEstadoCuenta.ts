import { useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { AccountStatement, WalletStatement } from "@/interfaces/ITransaction";
import { getAccountStatement, getWalletStatement } from "@/services/transaction.service";

// yyyy-MM-dd in the viewer's local time, for <input type="date">.
const toInputDate = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// Loads both tabs at once (General + Recargas) for the same client and
// range, so switching tabs is instant and both always show the same period.
export const useEstadoCuenta = () => {
  const today = new Date();
  const [start, setStart] = useState(toInputDate(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [end, setEnd] = useState(toInputDate(today));
  const [general, setGeneral] = useState<AccountStatement | null>(null);
  const [wallet, setWallet] = useState<WalletStatement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (personInternalId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const args = {
        schoolId,
        personInternalId,
        start: start ? `${start}T00:00:00` : undefined,
        end: end ? `${end}T23:59:59` : undefined,
      };
      const [generalData, walletData] = await Promise.all([getAccountStatement(args), getWalletStatement(args)]);
      setGeneral(generalData);
      setWallet(walletData);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al cargar el estado de cuenta");
      setGeneral(null);
      setWallet(null);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setGeneral(null);
    setWallet(null);
    setError(null);
  };

  return { start, setStart, end, setEnd, general, wallet, loading, error, load, clear };
};
