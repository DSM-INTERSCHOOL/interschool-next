import commerceApi from "./commerceApi";
import { ProductSatCreate, ProductSatRead, ProductSatUpdate } from "@/interfaces/IProductSat";

interface ServiceArgs {
  schoolId: string | number | null;
}

interface ProductSatArgs extends ServiceArgs {
  productSatId: number;
}

export const getProductSats = async ({ schoolId }: ServiceArgs): Promise<ProductSatRead[]> => {
  const response = await commerceApi.get<ProductSatRead[]>(`/schools/${schoolId}/product-sat`);
  return response.data;
};

export const getProductSat = async ({
  schoolId,
  productSatId,
}: ProductSatArgs): Promise<ProductSatRead> => {
  const response = await commerceApi.get<ProductSatRead>(
    `/schools/${schoolId}/product-sat/${productSatId}`
  );
  return response.data;
};

export const createProductSat = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: ProductSatCreate }): Promise<ProductSatRead> => {
  const response = await commerceApi.post<ProductSatRead>(`/schools/${schoolId}/product-sat`, dto);
  return response.data;
};

export const updateProductSat = async ({
  schoolId,
  productSatId,
  dto,
}: ProductSatArgs & { dto: ProductSatUpdate }): Promise<ProductSatRead> => {
  const response = await commerceApi.put<ProductSatRead>(
    `/schools/${schoolId}/product-sat/${productSatId}`,
    dto
  );
  return response.data;
};

export const deleteProductSat = async ({ schoolId, productSatId }: ProductSatArgs): Promise<void> => {
  await commerceApi.delete(`/schools/${schoolId}/product-sat/${productSatId}`);
};
