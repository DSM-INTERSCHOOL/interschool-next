import commerceApi from "./commerceApi";
import {
  EntradaRequest,
  InventoryRead,
  KardexRead,
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
