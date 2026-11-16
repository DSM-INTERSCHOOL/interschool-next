import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { TopCategoryRead } from "@/interfaces/ITopCategory";
import { getTopCategories } from "@/services/topCategory.service";

export const useTopCategories = () => {
  const [topCategories, setTopCategories] = useState<TopCategoryRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { schoolId } = getOrgConfig();
    getTopCategories({ schoolId })
      .then(setTopCategories)
      .catch((err: any) => {
        setError(err.response?.data?.detail || err.message || "Error al cargar las categorías");
      })
      .finally(() => setLoading(false));
  }, []);

  return { topCategories, loading, error };
};
