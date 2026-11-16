import commerceApi from "./commerceApi";
import { CfdiRead } from "@/interfaces/ICfdi";

interface ServiceArgs {
  schoolId: string | number | null;
}

export const getCfdiList = async ({
  schoolId,
  filters,
}: ServiceArgs & { filters?: string }): Promise<CfdiRead[]> => {
  const response = await commerceApi.get<CfdiRead[]>(`/schools/${schoolId}/cfdi`, {
    params: filters ? { filters } : undefined,
  });
  return response.data;
};

export const getCfdiForOrder = async ({
  schoolId,
  orderId,
}: ServiceArgs & { orderId: number }): Promise<CfdiRead[]> => {
  const response = await commerceApi.get<CfdiRead[]>(`/schools/${schoolId}/orders/${orderId}/cfdi`);
  return response.data;
};

// Fetches the file as a blob and triggers a browser download -- the
// backend proxies the bytes straight from factura-electronica, it never
// stores the XML/PDF itself (see CfdiService on the backend).
const downloadBlob = async (url: string, filename: string) => {
  const response = await commerceApi.get(url, { responseType: "blob" });
  const blobUrl = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(blobUrl);
};

export const downloadCfdiXml = async ({ schoolId, cfdiId }: ServiceArgs & { cfdiId: number }) =>
  downloadBlob(`/schools/${schoolId}/cfdi/${cfdiId}/xml`, `factura-${cfdiId}.xml`);

export const downloadCfdiPdf = async ({ schoolId, cfdiId }: ServiceArgs & { cfdiId: number }) =>
  downloadBlob(`/schools/${schoolId}/cfdi/${cfdiId}/pdf`, `factura-${cfdiId}.pdf`);
