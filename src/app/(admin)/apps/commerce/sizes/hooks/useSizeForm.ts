import { useEffect, useState } from "react";
import { useAppRouter as useRouter } from "@/hooks/useAppRouter";
import { getOrgConfig } from "@/lib/orgConfig";
import { createSize, getSize, updateSize } from "@/services/size.service";

export interface SizeFormData {
  description: string;
}

export const useSizeForm = (sizeId?: number) => {
  const router = useRouter();

  const [formData, setFormData] = useState<SizeFormData>({ description: "" });
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!sizeId) return;
    const load = async () => {
      try {
        setLoading(true);
        const { schoolId } = getOrgConfig();
        const size = await getSize({ schoolId, sizeId });
        setFormData({ description: size.description });
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || "Error al cargar la talla");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sizeId]);

  const updateFormField = <K extends keyof SizeFormData>(field: K, value: SizeFormData[K]) => {
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
      if (sizeId) {
        await updateSize({ schoolId, sizeId, dto });
      } else {
        await createSize({ schoolId, dto });
      }
      router.push("/apps/commerce/sizes");
    } catch (err: any) {
      setSaveError(err.response?.data?.detail || err.message || "Error al guardar la talla");
    } finally {
      setSaveLoading(false);
    }
  };

  return { formData, updateFormField, loading, saveLoading, error, saveError, handleSave };
};
