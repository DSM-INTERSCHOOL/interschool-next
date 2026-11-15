import commerceApi from "./commerceApi";
import { PaymentChannelConfigRead, PaymentChannelConfigSet } from "@/interfaces/IPaymentChannelConfig";

interface ServiceArgs {
  schoolId: string | number | null;
}

export const getPaymentChannelConfig = async ({ schoolId }: ServiceArgs): Promise<PaymentChannelConfigRead[]> => {
  const response = await commerceApi.get<PaymentChannelConfigRead[]>(`/schools/${schoolId}/payment-channels`);
  return response.data;
};

export const setPaymentChannelConfig = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: PaymentChannelConfigSet }): Promise<PaymentChannelConfigRead[]> => {
  const response = await commerceApi.put<PaymentChannelConfigRead[]>(`/schools/${schoolId}/payment-channels`, dto);
  return response.data;
};
