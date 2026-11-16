import commerceApi from "./commerceApi";
import { SizeCreate, SizeRead, SizeUpdate } from "@/interfaces/ISize";

interface ServiceArgs {
  schoolId: string | number | null;
}

interface SizeArgs extends ServiceArgs {
  sizeId: number;
}

export const getSizes = async ({ schoolId }: ServiceArgs): Promise<SizeRead[]> => {
  const response = await commerceApi.get<SizeRead[]>(`/schools/${schoolId}/sizes`);
  return response.data;
};

export const getSize = async ({ schoolId, sizeId }: SizeArgs): Promise<SizeRead> => {
  const response = await commerceApi.get<SizeRead>(`/schools/${schoolId}/sizes/${sizeId}`);
  return response.data;
};

export const createSize = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: SizeCreate }): Promise<SizeRead> => {
  const response = await commerceApi.post<SizeRead>(`/schools/${schoolId}/sizes`, dto);
  return response.data;
};

export const updateSize = async ({
  schoolId,
  sizeId,
  dto,
}: SizeArgs & { dto: SizeUpdate }): Promise<SizeRead> => {
  const response = await commerceApi.put<SizeRead>(`/schools/${schoolId}/sizes/${sizeId}`, dto);
  return response.data;
};

export const deleteSize = async ({ schoolId, sizeId }: SizeArgs): Promise<void> => {
  await commerceApi.delete(`/schools/${schoolId}/sizes/${sizeId}`);
};
