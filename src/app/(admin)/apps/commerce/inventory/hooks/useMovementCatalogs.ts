import { useCallback, useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { ProductRead } from "@/interfaces/IProduct";
import { ColorRead } from "@/interfaces/IColor";
import { SizeRead } from "@/interfaces/ISize";
import { WarehouseRead } from "@/interfaces/IWarehouse";
import { InventoryRead } from "@/interfaces/IInventory";
import { getProducts } from "@/services/product.service";
import { getColors } from "@/services/color.service";
import { getSizes } from "@/services/size.service";
import { getWarehouses } from "@/services/warehouse.service";
import { getInventories } from "@/services/inventory.service";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";

// Shared by the inventory list page + all three movement forms -- both for
// populating selects/resolving ids to display names, and (inventories) for
// showing current stock as a line's product/color/size selection changes.
// Reloaded on mount and whenever the tab regains focus (see
// useRefetchOnFocus) so a product/color/size/warehouse created elsewhere
// shows up here without needing a hard refresh.
export const useMovementCatalogs = () => {
  const [products, setProducts] = useState<ProductRead[]>([]);
  const [colors, setColors] = useState<ColorRead[]>([]);
  const [sizes, setSizes] = useState<SizeRead[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseRead[]>([]);
  const [inventories, setInventories] = useState<InventoryRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    const { schoolId } = getOrgConfig();
    setLoading(true);
    Promise.all([
      getProducts({ schoolId, limit: 500 }),
      getColors({ schoolId }),
      getSizes({ schoolId }),
      getWarehouses({ schoolId }),
      getInventories({ schoolId }),
    ])
      .then(([productsData, colorsData, sizesData, warehousesData, inventoriesData]) => {
        setProducts(productsData);
        setColors(colorsData);
        setSizes(sizesData);
        setWarehouses(warehousesData);
        setInventories(inventoriesData);
      })
      .catch((err: any) => {
        setError(err.response?.data?.detail || err.message || "Error al cargar los catálogos");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useRefetchOnFocus(load);

  return { products, colors, sizes, warehouses, inventories, loading, error, reload: load };
};
