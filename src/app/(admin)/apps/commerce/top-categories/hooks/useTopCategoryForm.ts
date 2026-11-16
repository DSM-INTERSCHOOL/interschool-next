import { useEffect, useState } from "react";
import { useAppRouter as useRouter } from "@/hooks/useAppRouter";
import { getOrgConfig } from "@/lib/orgConfig";
import { createTopCategory, getTopCategory, updateTopCategory } from "@/services/topCategory.service";

export interface TopCategoryFormData {
  description: string;
}

export const useTopCategoryForm = (topCategoryId?: number) => {
  const router = useRouter();

  const [formData, setFormData] = useState<TopCategoryFormData>({ description: "" });
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!topCategoryId) return;
    const load = async () => {
      try {
        setLoading(true);
        const { schoolId } = getOrgConfig();
        const topCategory = await getTopCategory({ schoolId, topCategoryId });
        setFormData({ description: topCategory.description });
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || "Error al cargar la categoría");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [topCategoryId]);

  const updateFormField = <K extends keyof TopCategoryFormData>(
    field: K,
    value: TopCategoryFormData[K]
  ) => {
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
      if (topCategoryId) {
        await updateTopCategory({ schoolId, topCategoryId, dto });
      } else {
        await createTopCategory({ schoolId, dto });
      }
      router.push("/apps/commerce/top-categories");
    } catch (err: any) {
      setSaveError(err.response?.data?.detail || err.message || "Error al guardar la categoría");
    } finally {
      setSaveLoading(false);
    }
  };

  return { formData, updateFormField, loading, saveLoading, error, saveError, handleSave };
};
