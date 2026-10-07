import commerceApi from "./commerceApi";
import {
  CheckoutRequest,
  OrderCreate,
  OrderDetailCreate,
  OrderDetailRead,
  OrderDetailUpdate,
  OrderRead,
  OrderUpdate,
  PaymentInstructionsRead,
} from "@/interfaces/IOrder";

interface ServiceArgs {
  schoolId: string | number | null;
}

interface OrderArgs extends ServiceArgs {
  orderId: number;
}

export const getOrders = async ({
  schoolId,
  filters,
}: ServiceArgs & { filters?: string }): Promise<OrderRead[]> => {
  const response = await commerceApi.get<OrderRead[]>(`/schools/${schoolId}/orders`, {
    params: filters ? { filters } : undefined,
  });
  return response.data;
};

export const getOrder = async ({ schoolId, orderId }: OrderArgs): Promise<OrderRead> => {
  const response = await commerceApi.get<OrderRead>(`/schools/${schoolId}/orders/${orderId}`);
  return response.data;
};

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

interface OrderDetailArgs extends ServiceArgs {
  detailId: number;
}

export const updateOrderDetail = async ({
  schoolId,
  detailId,
  dto,
}: OrderDetailArgs & { dto: OrderDetailUpdate }): Promise<OrderDetailRead> => {
  const response = await commerceApi.put<OrderDetailRead>(
    `/schools/${schoolId}/order-details/${detailId}`,
    dto
  );
  return response.data;
};

export const deleteOrderDetail = async ({ schoolId, detailId }: OrderDetailArgs): Promise<void> => {
  await commerceApi.delete(`/schools/${schoolId}/order-details/${detailId}`);
};

// Restores inventory for any tracked lines if the order had already been
// placed; no-op (for inventory) if it was still PENDING.
export const cancelOrder = async ({ schoolId, orderId }: OrderArgs): Promise<OrderRead> => {
  const response = await commerceApi.post<OrderRead>(`/schools/${schoolId}/orders/${orderId}/cancel`);
  return response.data;
};

// Sets the order's payment_method and marks it PLACED, returning what to
// show the customer -- for VENTANILLA just the total/order number, for
// SPEI the client's CLABE (looked up server-side from `person`).
export const checkoutOrder = async ({
  schoolId,
  orderId,
  dto,
}: OrderArgs & { dto: CheckoutRequest }): Promise<PaymentInstructionsRead> => {
  const response = await commerceApi.post<PaymentInstructionsRead>(
    `/schools/${schoolId}/orders/${orderId}/checkout`,
    dto
  );
  return response.data;
};
