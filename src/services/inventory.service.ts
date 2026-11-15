import commerceApi from "./commerceApi";
import {
  CaptureRequest,
  EntradaRequest,
  InventoryRead,
  KardexRead,
  ProductKardexRead,
  ProductMovementReport,
  SalidaRequest,
  TransferenciaRequest,
  WarehouseMovementReport,
} from "@/interfaces/IInventory";

interface ServiceArgs {
  schoolId: string | number | null;
}

export const getInventories = async ({ schoolId }: ServiceArgs): Promise<InventoryRead[]> => {
  const response = await commerceApi.get<InventoryRead[]>(`/schools/${schoolId}/inventories`);
  return response.data;
};

// Movement history for one product, most recent first (the backend orders
// product-kardex by id desc) -- used to find the last cost recorded for a
// given product/color/size. Filtered by product_id only (the generic
// filter DSL can't express "color_id IS NULL"), so callers match
// color/size client-side, the same way stock lookup already does.
export const getProductKardexHistory = async ({
  schoolId,
  productId,
}: ServiceArgs & { productId: number }): Promise<ProductKardexRead[]> => {
  const params = new URLSearchParams({ filters: `product_id::eq::${productId}` });
  const response = await commerceApi.get<ProductKardexRead[]>(
    `/schools/${schoolId}/product-kardex?${params.toString()}`
  );
  return response.data;
};

export const createEntrada = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: EntradaRequest }): Promise<KardexRead> => {
  const response = await commerceApi.post<KardexRead>(
    `/schools/${schoolId}/inventories/transactions/entrada`,
    dto
  );
  return response.data;
};

export const createSalida = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: SalidaRequest }): Promise<KardexRead> => {
  const response = await commerceApi.post<KardexRead>(
    `/schools/${schoolId}/inventories/transactions/salida`,
    dto
  );
  return response.data;
};

export const createTransferencia = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: TransferenciaRequest }): Promise<KardexRead> => {
  const response = await commerceApi.post<KardexRead>(
    `/schools/${schoolId}/inventories/transactions/transferencia`,
    dto
  );
  return response.data;
};

// Physical inventory count: each line's counted_quantity becomes the
// recorded stock for that variant; the backend logs only the discrepancy.
export const createCaptura = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: CaptureRequest }): Promise<KardexRead> => {
  const response = await commerceApi.post<KardexRead>(
    `/schools/${schoolId}/inventories/transactions/captura`,
    dto
  );
  return response.data;
};

export const getProductMovementReport = async ({
  schoolId,
  productId,
  warehouseId,
  colorId,
  sizeId,
  start,
  end,
}: ServiceArgs & {
  productId: number;
  warehouseId: number;
  colorId?: number | null;
  sizeId?: number | null;
  start?: string;
  end?: string;
}): Promise<ProductMovementReport> => {
  const params = new URLSearchParams();
  params.append("product_id", String(productId));
  params.append("warehouse_id", String(warehouseId));
  if (colorId !== undefined && colorId !== null) params.append("color_id", String(colorId));
  if (sizeId !== undefined && sizeId !== null) params.append("size_id", String(sizeId));
  if (start) params.append("start", start);
  if (end) params.append("end", end);
  const response = await commerceApi.get<ProductMovementReport>(
    `/schools/${schoolId}/product-kardex/report?${params.toString()}`
  );
  return response.data;
};

export const getWarehouseMovementReport = async ({
  schoolId,
  warehouseId,
  topCategoryId,
  start,
  end,
}: ServiceArgs & {
  warehouseId: number;
  topCategoryId?: number | null;
  start?: string;
  end?: string;
}): Promise<WarehouseMovementReport> => {
  const params = new URLSearchParams();
  params.append("warehouse_id", String(warehouseId));
  if (topCategoryId !== undefined && topCategoryId !== null) params.append("top_category_id", String(topCategoryId));
  if (start) params.append("start", start);
  if (end) params.append("end", end);
  const response = await commerceApi.get<WarehouseMovementReport>(
    `/schools/${schoolId}/product-kardex/warehouse-report?${params.toString()}`
  );
  return response.data;
};
