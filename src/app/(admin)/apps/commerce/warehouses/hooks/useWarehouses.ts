import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { WarehouseRead } from "@/interfaces/IWarehouse";
import { deleteWarehouse, getWarehouses, setWarehouseForSale } from "@/services/warehouse.service";

export const useWarehouses = () => {
  const [warehouses, setWarehouses] = useState<WarehouseRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const data = await getWarehouses({ schoolId });
      setWarehouses(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al cargar los almacenes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const removeWarehouse = async (warehouseId: number) => {
    const { schoolId } = getOrgConfig();
    await deleteWarehouse({ schoolId, warehouseId });
    setWarehouses((prev) => prev.filter((warehouse) => warehouse.id !== warehouseId));
  };

  // The backend unsets every other warehouse's for_sale as a side effect of
  // this call, so the whole list is reloaded rather than patching one row.
  const markForSale = async (warehouseId: number) => {
    try {
      setActionLoading(warehouseId);
      const { schoolId } = getOrgConfig();
      await setWarehouseForSale({ schoolId, warehouseId });
      await loadWarehouses();
    } finally {
      setActionLoading(null);
    }
  };

  return {
    warehouses,
    loading,
    error,
    actionLoading,
    removeWarehouse,
    markForSale,
    reload: loadWarehouses,
  };
};
