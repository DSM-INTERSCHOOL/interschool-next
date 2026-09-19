import { useEffect, useState } from "react";
import { useAppRouter as useRouter } from "@/hooks/useAppRouter";
import { getOrgConfig } from "@/lib/orgConfig";
import { createProductSat, getProductSat, updateProductSat } from "@/services/productSat.service";

export interface ProductSatFormData {
  key: string;
  description: string;
}

export const useProductSatForm = (productSatId?: number) => {
  const router = useRouter();

  const [formData, setFormData] = useState<ProductSatFormData>({ key: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!productSatId) return;
    const load = async () => {
      try {
        setLoading(true);
        const { schoolId } = getOrgConfig();
        const productSat = await getProductSat({ schoolId, productSatId });
        setFormData({ key: productSat.key, description: productSat.description });
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || "Error al cargar el código SAT");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productSatId]);

  const updateFormField = <K extends keyof ProductSatFormData>(
    field: K,
    value: ProductSatFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    if (!formData.key.trim()) {
      setSaveError("La clave SAT es requerida");
      return false;
    }
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
      const dto = { key: formData.key.trim(), description: formData.description.trim() };
      if (productSatId) {
        await updateProductSat({ schoolId, productSatId, dto });
      } else {
        await createProductSat({ schoolId, dto });
      }
      router.push("/apps/commerce/product-sat");
    } catch (err: any) {
      setSaveError(err.response?.data?.detail || err.message || "Error al guardar el código SAT");
    } finally {
      setSaveLoading(false);
    }
  };

  return { formData, updateFormField, loading, saveLoading, error, saveError, handleSave };
};
