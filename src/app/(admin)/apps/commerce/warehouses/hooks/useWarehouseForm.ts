import { useEffect, useState } from "react";
import { useAppRouter as useRouter } from "@/hooks/useAppRouter";
import { getOrgConfig } from "@/lib/orgConfig";
import { createWarehouse, getWarehouse, updateWarehouse } from "@/services/warehouse.service";

export interface WarehouseFormData {
  description: string;
  for_sale: boolean;
}

export const useWarehouseForm = (warehouseId?: number) => {
  const router = useRouter();

  const [formData, setFormData] = useState<WarehouseFormData>({ description: "", for_sale: false });
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!warehouseId) return;
    const load = async () => {
      try {
        setLoading(true);
        const { schoolId } = getOrgConfig();
        const warehouse = await getWarehouse({ schoolId, warehouseId });
        setFormData({ description: warehouse.description, for_sale: warehouse.for_sale });
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || "Error al cargar el almacén");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [warehouseId]);

  const updateFormField = <K extends keyof WarehouseFormData>(field: K, value: WarehouseFormData[K]) => {
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
      const dto = { description: formData.description.trim(), for_sale: formData.for_sale };
      if (warehouseId) {
        await updateWarehouse({ schoolId, warehouseId, dto });
      } else {
        await createWarehouse({ schoolId, dto });
      }
      router.push("/apps/commerce/warehouses");
    } catch (err: any) {
      setSaveError(err.response?.data?.detail || err.message || "Error al guardar el almacén");
    } finally {
      setSaveLoading(false);
    }
  };

  return { formData, updateFormField, loading, saveLoading, error, saveError, handleSave };
};
