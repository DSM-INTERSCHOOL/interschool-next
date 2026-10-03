import commerceApi from "./commerceApi";
import { OrderCreate, OrderDetailCreate, OrderDetailRead, OrderRead, OrderUpdate } from "@/interfaces/IOrder";

interface ServiceArgs {
  schoolId: string | number | null;
}

interface OrderArgs extends ServiceArgs {
  orderId: number;
}

export const createOrder = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: OrderCreate }): Promise<OrderRead> => {
  const response = await commerceApi.post<OrderRead>(`/schools/${schoolId}/orders`, dto);
  return response.data;
};

export const updateOrder = async ({
  schoolId,
  orderId,
  dto,
}: OrderArgs & { dto: OrderUpdate }): Promise<OrderRead> => {
  const response = await commerceApi.put<OrderRead>(`/schools/${schoolId}/orders/${orderId}`, dto);
  return response.data;
};

export const createOrderDetail = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: OrderDetailCreate }): Promise<OrderDetailRead> => {
  const response = await commerceApi.post<OrderDetailRead>(`/schools/${schoolId}/order-details`, dto);
  return response.data;
};
