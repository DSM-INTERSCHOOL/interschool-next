import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { TopCategoryRead } from "@/interfaces/ITopCategory";
import { deleteTopCategory, getTopCategories } from "@/services/topCategory.service";

export const useTopCategories = () => {
  const [topCategories, setTopCategories] = useState<TopCategoryRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTopCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const data = await getTopCategories({ schoolId });
      setTopCategories(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al cargar los clasificadores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopCategories();
  }, []);

  const removeTopCategory = async (topCategoryId: number) => {
    const { schoolId } = getOrgConfig();
    await deleteTopCategory({ schoolId, topCategoryId });
    setTopCategories((prev) => prev.filter((topCategory) => topCategory.id !== topCategoryId));
  };

  return { topCategories, loading, error, removeTopCategory, reload: loadTopCategories };
};
