import { useCallback, useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import {
  SalesByCategoryProductRow,
  SalesByCategoryRow,
  SalesByProductRow,
  SalesByTopCategoryRow,
  SalesByUserRow,
  SalesGeneralReport,
} from "@/interfaces/ISalesReport";
import {
  getSalesByCategoryProductReport,
  getSalesByCategoryReport,
  getSalesByProductReport,
  getSalesByTopCategoryReport,
  getSalesByUserReport,
  getSalesGeneralReport,
} from "@/services/salesReport.service";

export type ReportKey =
  | "general"
  | "by-product"
  | "by-top-category"
  | "by-category"
  | "by-category-product"
  | "by-user";

export const REPORT_TABS: { value: ReportKey; label: string }[] = [
  { value: "general", label: "Venta general" },
  { value: "by-product", label: "Venta por producto" },
  { value: "by-top-category", label: "Venta por categoría" },
  { value: "by-category", label: "Venta por clasificador" },
  { value: "by-category-product", label: "Venta por clasificador-producto" },
  { value: "by-user", label: "Venta por usuario" },
];

const firstDayOfMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
};

const todayLocalDate = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
};

export const useReportesForm = () => {
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(todayLocalDate);
  const [activeReport, setActiveReport] = useState<ReportKey>("general");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [general, setGeneral] = useState<SalesGeneralReport | null>(null);
  const [byProduct, setByProduct] = useState<SalesByProductRow[] | null>(null);
  const [byTopCategory, setByTopCategory] = useState<SalesByTopCategoryRow[] | null>(null);
  const [byCategory, setByCategory] = useState<SalesByCategoryRow[] | null>(null);
  const [byCategoryProduct, setByCategoryProduct] = useState<SalesByCategoryProductRow[] | null>(null);
  const [byUser, setByUser] = useState<SalesByUserRow[] | null>(null);

  const load = useCallback(async () => {
    if (!startDate || !endDate) return;
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const args = { schoolId, start: startDate, end: endDate };
      switch (activeReport) {
        case "general":
          setGeneral(await getSalesGeneralReport(args));
          break;
        case "by-product":
          setByProduct(await getSalesByProductReport(args));
          break;
        case "by-top-category":
          setByTopCategory(await getSalesByTopCategoryReport(args));
          break;
        case "by-category":
          setByCategory(await getSalesByCategoryReport(args));
          break;
        case "by-category-product":
          setByCategoryProduct(await getSalesByCategoryProductReport(args));
          break;
        case "by-user":
          setByUser(await getSalesByUserReport(args));
          break;
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al cargar el reporte");
    } finally {
      setLoading(false);
    }
  }, [activeReport, startDate, endDate]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    activeReport,
    setActiveReport,
    loading,
    error,
    general,
    byProduct,
    byTopCategory,
    byCategory,
    byCategoryProduct,
    byUser,
    reload: load,
  };
};
