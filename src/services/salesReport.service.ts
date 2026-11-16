import commerceApi from "./commerceApi";
import {
  SalesByCategoryProductRow,
  SalesByCategoryRow,
  SalesByProductRow,
  SalesByTopCategoryRow,
  SalesByUserRow,
  SalesGeneralReport,
} from "@/interfaces/ISalesReport";

interface ReportArgs {
  schoolId: string | number | null;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
}

const buildParams = ({ start, end }: Pick<ReportArgs, "start" | "end">) => {
  const params = new URLSearchParams();
  params.append("start", start);
  params.append("end", end);
  return params.toString();
};

export const getSalesGeneralReport = async ({ schoolId, start, end }: ReportArgs): Promise<SalesGeneralReport> => {
  const response = await commerceApi.get<SalesGeneralReport>(
    `/schools/${schoolId}/reports/sales/general?${buildParams({ start, end })}`
  );
  return response.data;
};

export const getSalesByProductReport = async ({
  schoolId,
  start,
  end,
}: ReportArgs): Promise<SalesByProductRow[]> => {
  const response = await commerceApi.get<SalesByProductRow[]>(
    `/schools/${schoolId}/reports/sales/by-product?${buildParams({ start, end })}`
  );
  return response.data;
};

export const getSalesByTopCategoryReport = async ({
  schoolId,
  start,
  end,
}: ReportArgs): Promise<SalesByTopCategoryRow[]> => {
  const response = await commerceApi.get<SalesByTopCategoryRow[]>(
    `/schools/${schoolId}/reports/sales/by-top-category?${buildParams({ start, end })}`
  );
  return response.data;
};

export const getSalesByCategoryReport = async ({
  schoolId,
  start,
  end,
}: ReportArgs): Promise<SalesByCategoryRow[]> => {
  const response = await commerceApi.get<SalesByCategoryRow[]>(
    `/schools/${schoolId}/reports/sales/by-category?${buildParams({ start, end })}`
  );
  return response.data;
};

export const getSalesByCategoryProductReport = async ({
  schoolId,
  start,
  end,
}: ReportArgs): Promise<SalesByCategoryProductRow[]> => {
  const response = await commerceApi.get<SalesByCategoryProductRow[]>(
    `/schools/${schoolId}/reports/sales/by-category-product?${buildParams({ start, end })}`
  );
  return response.data;
};

export const getSalesByUserReport = async ({ schoolId, start, end }: ReportArgs): Promise<SalesByUserRow[]> => {
  const response = await commerceApi.get<SalesByUserRow[]>(
    `/schools/${schoolId}/reports/sales/by-user?${buildParams({ start, end })}`
  );
  return response.data;
};
