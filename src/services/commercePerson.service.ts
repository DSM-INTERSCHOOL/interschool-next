import commerceApi from "./commerceApi";
import { CommercePersonRead, CommercePersonUpsert } from "@/interfaces/ICommercePerson";

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

// ADMIN, or the caller looking up their own record (backend-enforced) --
// e.g. self-service checkout reading its own wallet balance.
export const getCommercePerson = async ({
  schoolId,
  personInternalId,
}: ServiceArgs & { personInternalId: string }): Promise<CommercePersonRead> => {
  const response = await commerceApi.get<CommercePersonRead>(`/schools/${schoolId}/persons/${personInternalId}`);
  return response.data;
};

// ADMIN only (backend-enforced). The backend route upserts on
// (school_id, person_internal_id) -- calling this again for an existing
// person replaces their role and every other field here, it never 409s.
// Used for both create and edit.
export const upsertCommercePerson = async ({
  schoolId,
  dto,
}: ServiceArgs & { dto: CommercePersonUpsert }): Promise<CommercePersonRead> => {
  const response = await commerceApi.post<CommercePersonRead>(`/schools/${schoolId}/persons`, dto);
  return response.data;
};

// ADMIN only (backend-enforced).
export const deleteCommercePerson = async ({
  schoolId,
  personInternalId,
}: ServiceArgs & { personInternalId: string }): Promise<void> => {
  await commerceApi.delete(`/schools/${schoolId}/persons/${personInternalId}`);
};
