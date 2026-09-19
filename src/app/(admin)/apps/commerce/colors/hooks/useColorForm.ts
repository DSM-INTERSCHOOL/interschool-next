import { useEffect, useState } from "react";
import { useAppRouter as useRouter } from "@/hooks/useAppRouter";
import { getOrgConfig } from "@/lib/orgConfig";
import { createColor, getColor, updateColor } from "@/services/color.service";

export interface ColorFormData {
  description: string;
}

export const useColorForm = (colorId?: number) => {
  const router = useRouter();

  const [formData, setFormData] = useState<ColorFormData>({ description: "" });
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!colorId) return;
    const load = async () => {
      try {
        setLoading(true);
        const { schoolId } = getOrgConfig();
        const color = await getColor({ schoolId, colorId });
        setFormData({ description: color.description });
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || "Error al cargar el color");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [colorId]);

  const updateFormField = <K extends keyof ColorFormData>(field: K, value: ColorFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    if (!formData.description.trim()) {
      setSaveError("La descripción es requerida");
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
      const dto = { description: formData.description.trim() };
      if (colorId) {
        await updateColor({ schoolId, colorId, dto });
      } else {
        await createColor({ schoolId, dto });
      }
      router.push("/apps/commerce/colors");
    } catch (err: any) {
      setSaveError(err.response?.data?.detail || err.message || "Error al guardar el color");
    } finally {
      setSaveLoading(false);
    }
  };

  return { formData, updateFormField, loading, saveLoading, error, saveError, handleSave };
};
