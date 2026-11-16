import { useEffect, useState } from "react";
import { useAppRouter as useRouter } from "@/hooks/useAppRouter";
import { getOrgConfig } from "@/lib/orgConfig";
import { getTerminal, updateTerminal } from "@/services/terminal.service";

export interface TerminalFormData {
  device_id: string;
  name: string;
}

export const useTerminalForm = (terminalId: number) => {
  const router = useRouter();

  const [formData, setFormData] = useState<TerminalFormData>({ device_id: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { schoolId } = getOrgConfig();
        const terminal = await getTerminal({ schoolId, terminalId });
        setFormData({ device_id: terminal.device_id, name: terminal.name });
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || "Error al cargar la terminal");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [terminalId]);

  const updateFormField = <K extends keyof TerminalFormData>(field: K, value: TerminalFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    if (!formData.name.trim()) {
      setSaveError("El nombre es requerido");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      setSaveError(null);
      if (!validate()) return;

      const { schoolId } = getOrgConfig();
      // device_id is sent unchanged: it's the device's own identity, not editable here.
      const dto = { device_id: formData.device_id, name: formData.name.trim() };
      await updateTerminal({ schoolId, terminalId, dto });
      router.push("/apps/commerce/caja/terminales");
    } catch (err: any) {
      setSaveError(err.response?.data?.detail || err.message || "Error al guardar la terminal");
    } finally {
      setSaveLoading(false);
    }
  };

  return { formData, updateFormField, loading, saveLoading, error, saveError, handleSave };
};
