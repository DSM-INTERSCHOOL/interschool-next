import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { ProductRead, ProductStatus, ProductType } from "@/interfaces/IProduct";
import { deleteProduct, getProducts } from "@/services/product.service";

export const useProducts = () => {
  const [products, setProducts] = useState<ProductRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<ProductType | "">("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "">("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const data = await getProducts({
        schoolId,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        limit: 500,
      });
      setProducts(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, statusFilter]);

  const removeProduct = async (productId: number) => {
    const { schoolId } = getOrgConfig();
    await deleteProduct({ schoolId, productId });
    setProducts((prev) => prev.filter((product) => product.id !== productId));
  };

  return {
    products,
    loading,
    error,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    removeProduct,
    reload: loadProducts,
  };
};
