import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { SizeRead } from "@/interfaces/ISize";
import { deleteSize, getSizes } from "@/services/size.service";

export const useSizes = () => {
  const [sizes, setSizes] = useState<SizeRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSizes = async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const data = await getSizes({ schoolId });
      setSizes(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al cargar las tallas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSizes();
  }, []);

  const removeSize = async (sizeId: number) => {
    const { schoolId } = getOrgConfig();
    await deleteSize({ schoolId, sizeId });
    setSizes((prev) => prev.filter((size) => size.id !== sizeId));
  };

  return { sizes, loading, error, removeSize, reload: loadSizes };
};
