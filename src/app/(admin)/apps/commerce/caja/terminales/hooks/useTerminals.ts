import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { TerminalRead } from "@/interfaces/ITerminal";
import { deleteTerminal, getTerminals } from "@/services/terminal.service";

export const useTerminals = () => {
  const [terminals, setTerminals] = useState<TerminalRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTerminals = async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const data = await getTerminals({ schoolId });
      setTerminals(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al cargar las terminales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTerminals();
  }, []);

  const removeTerminal = async (terminalId: number) => {
    const { schoolId } = getOrgConfig();
    await deleteTerminal({ schoolId, terminalId });
    setTerminals((prev) => prev.filter((terminal) => terminal.id !== terminalId));
  };

  return { terminals, loading, error, removeTerminal, reload: loadTerminals };
};
