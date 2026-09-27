import commerceApi from "./commerceApi";
import { TopCategoryCreate, TopCategoryRead, TopCategoryUpdate } from "@/interfaces/ITopCategory";

interface ServiceArgs {
  schoolId: string | number | null;
}

interface TopCategoryArgs extends ServiceArgs {
  topCategoryId: number;
}

export const getTopCategories = async ({ schoolId }: ServiceArgs): Promise<TopCategoryRead[]> => {
  const response = await commerceApi.get<TopCategoryRead[]>(`/schools/${schoolId}/top-categories`);
  return response.data;
};

export const getTopCategory = async ({
  schoolId,
  topCategoryId,
}: TopCategoryArgs): Promise<TopCategoryRead> => {
  const response = await commerceApi.get<TopCategoryRead>(
    `/schools/${schoolId}/top-categories/${topCategoryId}`
  );
  return response.data;
};

export const createTopCategory = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: TopCategoryCreate }): Promise<TopCategoryRead> => {
  const response = await commerceApi.post<TopCategoryRead>(`/schools/${schoolId}/top-categories`, dto);
  return response.data;
};

export const updateTopCategory = async ({
  schoolId,
  topCategoryId,
  dto,
}: TopCategoryArgs & { dto: TopCategoryUpdate }): Promise<TopCategoryRead> => {
  const response = await commerceApi.put<TopCategoryRead>(
    `/schools/${schoolId}/top-categories/${topCategoryId}`,
    dto
  );
  return response.data;
};

export const deleteTopCategory = async ({ schoolId, topCategoryId }: TopCategoryArgs): Promise<void> => {
  await commerceApi.delete(`/schools/${schoolId}/top-categories/${topCategoryId}`);
};
