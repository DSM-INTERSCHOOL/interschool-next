import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { ProductRead } from "@/interfaces/IProduct";
import { getProducts } from "@/services/product.service";

// Restricts KIT sub-products to SINGLE products at the UI level (the
// backend doesn't forbid nesting a KIT inside another KIT structurally).
// No free-text search endpoint exists, so this fetches a bounded page once
// and the picker filters it client-side -- a school with more than 500
// SINGLE products will have some invisible here.
export const useSubProductCatalog = () => {
  const [candidates, setCandidates] = useState<ProductRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const { schoolId } = getOrgConfig();
        const data = await getProducts({ schoolId, type: "SINGLE", limit: 500 });
        setCandidates(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || "Error al cargar los productos");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { candidates, loading, error };
};
