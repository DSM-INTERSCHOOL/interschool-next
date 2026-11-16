import commerceApi from "./commerceApi";
import { OrderMode, TopCategoryCreate, TopCategoryRead, TopCategoryUpdate } from "@/interfaces/ITopCategory";

interface ServiceArgs {
  schoolId: string | number | null;
}

interface TopCategoryArgs extends ServiceArgs {
  topCategoryId: number;
}

interface OrderModeArgs extends ServiceArgs {
  orderMode: OrderMode;
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

export const getTopCategoryIdsForOrderMode = async ({
  schoolId,
  orderMode,
}: OrderModeArgs): Promise<number[]> => {
  const response = await commerceApi.get<number[]>(
    `/schools/${schoolId}/top-categories/order-modes/${orderMode}`
  );
  return response.data;
};

// Full replace, not incremental -- same semantics as a product's color_ids/size_ids.
export const setTopCategoryIdsForOrderMode = async ({
  schoolId,
  orderMode,
  topCategoryIds,
}: OrderModeArgs & { topCategoryIds: number[] }): Promise<number[]> => {
  const response = await commerceApi.put<number[]>(
    `/schools/${schoolId}/top-categories/order-modes/${orderMode}`,
    { top_category_ids: topCategoryIds }
  );
  return response.data;
};
