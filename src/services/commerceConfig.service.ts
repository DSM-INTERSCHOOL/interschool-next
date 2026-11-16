import commerceApi from "./commerceApi";
import { CommerceConfigRead, CommerceConfigUpsert } from "@/interfaces/ICommerceConfig";

interface ServiceArgs {
  schoolId: string | number | null;
}

export const getCommerceConfig = async ({ schoolId }: ServiceArgs): Promise<CommerceConfigRead> => {
  const response = await commerceApi.get<CommerceConfigRead>(`/schools/${schoolId}/config`);
  return response.data;
};

export const updateCommerceConfig = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: CommerceConfigUpsert }): Promise<CommerceConfigRead> => {
  const response = await commerceApi.put<CommerceConfigRead>(`/schools/${schoolId}/config`, dto);
  return response.data;
};
