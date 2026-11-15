import commerceApi from "./commerceApi";
import { PaymentMethodConfigRead, PaymentMethodConfigSet } from "@/interfaces/IPaymentMethodConfig";

interface ServiceArgs {
  schoolId: string | number | null;
}

export const getPaymentMethodConfig = async ({ schoolId }: ServiceArgs): Promise<PaymentMethodConfigRead[]> => {
  const response = await commerceApi.get<PaymentMethodConfigRead[]>(`/schools/${schoolId}/payment-methods`);
  return response.data;
};

export const setPaymentMethodConfig = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: PaymentMethodConfigSet }): Promise<PaymentMethodConfigRead[]> => {
  const response = await commerceApi.put<PaymentMethodConfigRead[]>(`/schools/${schoolId}/payment-methods`, dto);
  return response.data;
};
