import commerceApi from "./commerceApi";
import { CommercePersonRead } from "@/interfaces/ICommercePerson";

interface ServiceArgs {
  schoolId: string | number | null;
}

// ADMIN or CASHIER only (backend-enforced). `search` does a substring
// match on given_name/paternal_name/maternal_name/email -- used by
// OPERATOR-mode order entry to look up a client by name.
export const getCommercePersons = async ({
  schoolId,
  search,
}: ServiceArgs & { search?: string }): Promise<CommercePersonRead[]> => {
  const response = await commerceApi.get<CommercePersonRead[]>(`/schools/${schoolId}/persons`, {
    params: search ? { search } : undefined,
  });
  return response.data;
};
