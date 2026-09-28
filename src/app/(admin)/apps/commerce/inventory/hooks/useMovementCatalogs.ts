import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { ProductRead } from "@/interfaces/IProduct";
import { ColorRead } from "@/interfaces/IColor";
import { SizeRead } from "@/interfaces/ISize";
import { WarehouseRead } from "@/interfaces/IWarehouse";
import { getProducts } from "@/services/product.service";
import { getColors } from "@/services/color.service";
import { getSizes } from "@/services/size.service";
import { getWarehouses } from "@/services/warehouse.service";

// Fetched once and shared by the inventory list page + all three movement
// forms -- both for populating selects and for resolving ids to display
// names.
export const useMovementCatalogs = () => {
  const [products, setProducts] = useState<ProductRead[]>([]);
  const [colors, setColors] = useState<ColorRead[]>([]);
  const [sizes, setSizes] = useState<SizeRead[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { schoolId } = getOrgConfig();
    Promise.all([
      getProducts({ schoolId, limit: 500 }),
      getColors({ schoolId }),
      getSizes({ schoolId }),
      getWarehouses({ schoolId }),
    ])
      .then(([productsData, colorsData, sizesData, warehousesData]) => {
        setProducts(productsData);
        setColors(colorsData);
        setSizes(sizesData);
        setWarehouses(warehousesData);
      })
      .catch((err: any) => {
        setError(err.response?.data?.detail || err.message || "Error al cargar los catálogos");
      })
      .finally(() => setLoading(false));
  }, []);

  return { products, colors, sizes, warehouses, loading, error };
};
