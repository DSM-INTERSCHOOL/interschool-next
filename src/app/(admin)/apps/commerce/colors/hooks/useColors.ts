import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { ColorRead } from "@/interfaces/IColor";
import { deleteColor, getColors } from "@/services/color.service";

export const useColors = () => {
  const [colors, setColors] = useState<ColorRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadColors = async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const data = await getColors({ schoolId });
      setColors(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al cargar los colores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColors();
  }, []);

  const removeColor = async (colorId: number) => {
    const { schoolId } = getOrgConfig();
    await deleteColor({ schoolId, colorId });
    setColors((prev) => prev.filter((color) => color.id !== colorId));
  };

  return { colors, loading, error, removeColor, reload: loadColors };
};
