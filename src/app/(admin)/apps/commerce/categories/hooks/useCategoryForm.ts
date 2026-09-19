import { useEffect, useState } from "react";
import { useAppRouter as useRouter } from "@/hooks/useAppRouter";
import { getOrgConfig } from "@/lib/orgConfig";
import { createCategory, getCategory, updateCategory } from "@/services/category.service";

export interface CategoryFormData {
  description: string;
}

export const useCategoryForm = (categoryId?: number) => {
  const router = useRouter();

  const [formData, setFormData] = useState<CategoryFormData>({ description: "" });
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) return;
    const load = async () => {
      try {
        setLoading(true);
        const { schoolId } = getOrgConfig();
        const category = await getCategory({ schoolId, categoryId });
        setFormData({ description: category.description });
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || "Error al cargar la categoría");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [categoryId]);

  const updateFormField = <K extends keyof CategoryFormData>(field: K, value: CategoryFormData[K]) => {
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
      if (categoryId) {
        await updateCategory({ schoolId, categoryId, dto });
      } else {
        await createCategory({ schoolId, dto });
      }
      router.push("/apps/commerce/categories");
    } catch (err: any) {
      setSaveError(err.response?.data?.detail || err.message || "Error al guardar la categoría");
    } finally {
      setSaveLoading(false);
    }
  };

  return { formData, updateFormField, loading, saveLoading, error, saveError, handleSave };
};
