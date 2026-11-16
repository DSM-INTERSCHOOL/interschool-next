import { useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { ProductMovementReport } from "@/interfaces/IInventory";
import { getProductMovementReport } from "@/services/inventory.service";

export const useProductoKardexReport = () => {
  const [productId, setProductId] = useState<number | "">("");
  const [warehouseId, setWarehouseId] = useState<number | "">("");
  const [colorId, setColorId] = useState<number | "">("");
  const [sizeId, setSizeId] = useState<number | "">("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [report, setReport] = useState<ProductMovementReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (productId === "" || warehouseId === "") return;
    try {
      setLoading(true);
      setError(null);
      setSearched(true);
      const { schoolId } = getOrgConfig();
      const data = await getProductMovementReport({
        schoolId,
        productId: Number(productId),
        warehouseId: Number(warehouseId),
        colorId: colorId === "" ? undefined : Number(colorId),
        sizeId: sizeId === "" ? undefined : Number(sizeId),
        start: start ? `${start}T00:00:00` : undefined,
        end: end ? `${end}T23:59:59` : undefined,
      });
      setReport(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al cargar los movimientos");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    productId,
    setProductId,
    warehouseId,
    setWarehouseId,
    colorId,
    setColorId,
    sizeId,
    setSizeId,
    start,
    setStart,
    end,
    setEnd,
    report,
    loading,
    error,
    searched,
    search,
  };
};
