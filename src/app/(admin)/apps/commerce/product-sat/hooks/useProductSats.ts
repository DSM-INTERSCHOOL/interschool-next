import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { ProductSatRead } from "@/interfaces/IProductSat";
import { deleteProductSat, getProductSats } from "@/services/productSat.service";

export const useProductSats = () => {
  const [productSats, setProductSats] = useState<ProductSatRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProductSats = async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const data = await getProductSats({ schoolId });
      setProductSats(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al cargar los códigos SAT");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductSats();
  }, []);

  const removeProductSat = async (productSatId: number) => {
    const { schoolId } = getOrgConfig();
    await deleteProductSat({ schoolId, productSatId });
    setProductSats((prev) => prev.filter((item) => item.id !== productSatId));
  };

  return { productSats, loading, error, removeProductSat, reload: loadProductSats };
};
