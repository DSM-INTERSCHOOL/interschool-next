import commerceApi from "./commerceApi";
import { ColorCreate, ColorRead, ColorUpdate } from "@/interfaces/IColor";

interface ServiceArgs {
  schoolId: string | number | null;
}

interface ColorArgs extends ServiceArgs {
  colorId: number;
}

export const getColors = async ({ schoolId }: ServiceArgs): Promise<ColorRead[]> => {
  const response = await commerceApi.get<ColorRead[]>(`/schools/${schoolId}/colors`);
  return response.data;
};

export const getColor = async ({ schoolId, colorId }: ColorArgs): Promise<ColorRead> => {
  const response = await commerceApi.get<ColorRead>(`/schools/${schoolId}/colors/${colorId}`);
  return response.data;
};

export const createColor = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: ColorCreate }): Promise<ColorRead> => {
  const response = await commerceApi.post<ColorRead>(`/schools/${schoolId}/colors`, dto);
  return response.data;
};

export const updateColor = async ({
  schoolId,
  colorId,
  dto,
}: ColorArgs & { dto: ColorUpdate }): Promise<ColorRead> => {
  const response = await commerceApi.put<ColorRead>(`/schools/${schoolId}/colors/${colorId}`, dto);
  return response.data;
};

export const deleteColor = async ({ schoolId, colorId }: ColorArgs): Promise<void> => {
  await commerceApi.delete(`/schools/${schoolId}/colors/${colorId}`);
};
