import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { InventoryRead } from "@/interfaces/IInventory";
import { getInventories } from "@/services/inventory.service";

export const useInventoryList = () => {
  const [inventories, setInventories] = useState<InventoryRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const data = await getInventories({ schoolId });
      setInventories(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al cargar el inventario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { inventories, loading, error, reload: load };
};
