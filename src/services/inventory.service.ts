import commerceApi from "./commerceApi";
import {
  EntradaRequest,
  InventoryRead,
  KardexRead,
  ProductKardexRead,
  SalidaRequest,
  TransferenciaRequest,
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
