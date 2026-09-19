import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { CategoryRead } from "@/interfaces/ICategory";
import { deleteCategory, getCategories } from "@/services/category.service";

export const useCategories = () => {
  const [categories, setCategories] = useState<CategoryRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const data = await getCategories({ schoolId });
      setCategories(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al cargar las categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const removeCategory = async (categoryId: number) => {
    const { schoolId } = getOrgConfig();
    await deleteCategory({ schoolId, categoryId });
    setCategories((prev) => prev.filter((category) => category.id !== categoryId));
  };

  return { categories, loading, error, removeCategory, reload: loadCategories };
};
