import commerceApi from "./commerceApi";
import {
  ProductCreate,
  ProductPictureAdded,
  ProductRead,
  ProductType,
  ProductStatus,
  ProductUpdate,
} from "@/interfaces/IProduct";

interface ServiceArgs {
  schoolId: string | number | null;
}

interface ProductArgs extends ServiceArgs {
  productId: number;
}

interface GetProductsArgs extends ServiceArgs {
  colorId?: number;
  sizeId?: number;
  categoryId?: number;
  type?: ProductType;
  status?: ProductStatus;
  skip?: number;
  limit?: number;
}

// Backend has no free-text search param -- only these filters
// (color_id/size_id/category_id/type/status/skip/limit).
export const getProducts = async ({
  schoolId,
  colorId,
  sizeId,
  categoryId,
  type,
  status,
  skip,
  limit,
}: GetProductsArgs): Promise<ProductRead[]> => {
  const params = new URLSearchParams();
  if (colorId !== undefined) params.append("color_id", colorId.toString());
  if (sizeId !== undefined) params.append("size_id", sizeId.toString());
  if (categoryId !== undefined) params.append("category_id", categoryId.toString());
  if (type) params.append("type", type);
  if (status) params.append("status", status);
  if (skip !== undefined) params.append("skip", skip.toString());
  if (limit !== undefined) params.append("limit", limit.toString());

  const response = await commerceApi.get<ProductRead[]>(
    `/schools/${schoolId}/products?${params.toString()}`
  );
  return response.data;
};

export const getProduct = async ({ schoolId, productId }: ProductArgs): Promise<ProductRead> => {
  const response = await commerceApi.get<ProductRead>(`/schools/${schoolId}/products/${productId}`);
  return response.data;
};

export const createProduct = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: ProductCreate }): Promise<ProductRead> => {
  const response = await commerceApi.post<ProductRead>(`/schools/${schoolId}/products`, dto);
  return response.data;
};

export const updateProduct = async ({
  schoolId,
  productId,
  dto,
}: ProductArgs & { dto: ProductUpdate }): Promise<ProductRead> => {
  const response = await commerceApi.put<ProductRead>(`/schools/${schoolId}/products/${productId}`, dto);
  return response.data;
};

export const deleteProduct = async ({ schoolId, productId }: ProductArgs): Promise<void> => {
  await commerceApi.delete(`/schools/${schoolId}/products/${productId}`);
};

export const uploadProductPicture = async ({
  schoolId,
  productId,
  file,
}: ProductArgs & { file: File }): Promise<ProductPictureAdded> => {
  const formData = new FormData();
  formData.append("file", file);
  // Don't set Content-Type by hand -- axios/the browser needs to add the
  // multipart boundary itself when given a FormData body.
  const response = await commerceApi.post<ProductPictureAdded>(
    `/schools/${schoolId}/products/${productId}/pictures`,
    formData
  );
  return response.data;
};

export const deleteProductPicture = async ({
  schoolId,
  productId,
  pictureId,
}: ProductArgs & { pictureId: number }): Promise<void> => {
  await commerceApi.delete(`/schools/${schoolId}/products/${productId}/pictures/${pictureId}`);
};
