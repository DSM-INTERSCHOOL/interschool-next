import commerceApi from "./commerceApi";
import { WarehouseCreate, WarehouseRead, WarehouseUpdate } from "@/interfaces/IWarehouse";

interface ServiceArgs {
  schoolId: string | number | null;
}

interface WarehouseArgs extends ServiceArgs {
  warehouseId: number;
}

export const getWarehouses = async ({ schoolId }: ServiceArgs): Promise<WarehouseRead[]> => {
  const response = await commerceApi.get<WarehouseRead[]>(`/schools/${schoolId}/warehouses`);
  return response.data;
};

export const getWarehouse = async ({ schoolId, warehouseId }: WarehouseArgs): Promise<WarehouseRead> => {
  const response = await commerceApi.get<WarehouseRead>(`/schools/${schoolId}/warehouses/${warehouseId}`);
  return response.data;
};

export const createWarehouse = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: WarehouseCreate }): Promise<WarehouseRead> => {
  const response = await commerceApi.post<WarehouseRead>(`/schools/${schoolId}/warehouses`, dto);
  return response.data;
};

export const updateWarehouse = async ({
  schoolId,
  warehouseId,
  dto,
}: WarehouseArgs & { dto: WarehouseUpdate }): Promise<WarehouseRead> => {
  const response = await commerceApi.put<WarehouseRead>(
    `/schools/${schoolId}/warehouses/${warehouseId}`,
    dto
  );
  return response.data;
};

export const deleteWarehouse = async ({ schoolId, warehouseId }: WarehouseArgs): Promise<void> => {
  await commerceApi.delete(`/schools/${schoolId}/warehouses/${warehouseId}`);
};

// Marks this warehouse as THE for-sale one for the school; the backend
// unsets any other warehouse's for_sale as a side effect, so callers should
// refetch the whole list afterwards rather than patching one row locally.
export const setWarehouseForSale = async ({
  schoolId,
  warehouseId,
}: WarehouseArgs): Promise<WarehouseRead> => {
  const response = await commerceApi.put<WarehouseRead>(
    `/schools/${schoolId}/warehouses/${warehouseId}/forsale`
  );
  return response.data;
};
