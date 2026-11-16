import { useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { WarehouseMovementReport } from "@/interfaces/IInventory";
import { getWarehouseMovementReport } from "@/services/inventory.service";

const toLocalDate = (date: Date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

const todayLocalDate = () => toLocalDate(new Date());

const thirtyDaysAgoLocalDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return toLocalDate(date);
};

// Everything that moved in a warehouse (optionally narrowed to one
// top-category), across every product -- unlike useProductoKardexReport,
// there's no starting/ending balance to show (that only means something
// scoped to one fixed variant). Defaults to the last 30 days: the backend
// query has no LIMIT, so an empty range on a warehouse with years of
// history would pull its entire movement log in one request.
export const useWarehouseKardexReport = () => {
  const [warehouseId, setWarehouseId] = useState<number | "">("");
  const [topCategoryId, setTopCategoryId] = useState<number | "">("");
  const [start, setStart] = useState(thirtyDaysAgoLocalDate);
  const [end, setEnd] = useState(todayLocalDate);
  const [report, setReport] = useState<WarehouseMovementReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (warehouseId === "") return;
    try {
      setLoading(true);
      setError(null);
      setSearched(true);
      const { schoolId } = getOrgConfig();
      const data = await getWarehouseMovementReport({
        schoolId,
        warehouseId: Number(warehouseId),
        topCategoryId: topCategoryId === "" ? undefined : Number(topCategoryId),
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
    warehouseId,
    setWarehouseId,
    topCategoryId,
    setTopCategoryId,
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
