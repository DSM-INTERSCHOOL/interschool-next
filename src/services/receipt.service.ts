import commerceApi from "./commerceApi";
import { ReceiptRead } from "@/interfaces/IReceipt";

interface ServiceArgs {
  schoolId: string | number | null;
}

export const getReceipts = async ({
  schoolId,
  filters,
}: ServiceArgs & { filters?: string }): Promise<ReceiptRead[]> => {
  const params = new URLSearchParams();
  if (filters) params.append("filters", filters);
  const response = await commerceApi.get<ReceiptRead[]>(`/schools/${schoolId}/receipts?${params.toString()}`);
  return response.data;
};

export const getReceipt = async ({
  schoolId,
  receiptId,
}: ServiceArgs & { receiptId: number }): Promise<ReceiptRead> => {
  const response = await commerceApi.get<ReceiptRead>(`/schools/${schoolId}/receipts/${receiptId}`);
  return response.data;
};

export const getReceiptsForOrder = async ({
  schoolId,
  orderId,
}: ServiceArgs & { orderId: number }): Promise<ReceiptRead[]> => {
  const response = await commerceApi.get<ReceiptRead[]>(`/schools/${schoolId}/orders/${orderId}/receipts`);
  return response.data;
};
