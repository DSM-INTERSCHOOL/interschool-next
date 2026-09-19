import commerceApi from "./commerceApi";
import { CategoryCreate, CategoryRead, CategoryUpdate } from "@/interfaces/ICategory";

interface ServiceArgs {
  schoolId: string | number | null;
}

interface CategoryArgs extends ServiceArgs {
  categoryId: number;
}

export const getCategories = async ({ schoolId }: ServiceArgs): Promise<CategoryRead[]> => {
  const response = await commerceApi.get<CategoryRead[]>(`/schools/${schoolId}/categories`);
  return response.data;
};

export const getCategory = async ({ schoolId, categoryId }: CategoryArgs): Promise<CategoryRead> => {
  const response = await commerceApi.get<CategoryRead>(`/schools/${schoolId}/categories/${categoryId}`);
  return response.data;
};

export const createCategory = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: CategoryCreate }): Promise<CategoryRead> => {
  const response = await commerceApi.post<CategoryRead>(`/schools/${schoolId}/categories`, dto);
  return response.data;
};

export const updateCategory = async ({
  schoolId,
  categoryId,
  dto,
}: CategoryArgs & { dto: CategoryUpdate }): Promise<CategoryRead> => {
  const response = await commerceApi.put<CategoryRead>(
    `/schools/${schoolId}/categories/${categoryId}`,
    dto
  );
  return response.data;
};

export const deleteCategory = async ({ schoolId, categoryId }: CategoryArgs): Promise<void> => {
  await commerceApi.delete(`/schools/${schoolId}/categories/${categoryId}`);
};
