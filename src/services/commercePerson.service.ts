import commerceApi from "./commerceApi";
import { CommercePersonPage, CommercePersonRead, CommercePersonUpsert } from "@/interfaces/ICommercePerson";

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

// ADMIN or CASHIER only (backend-enforced). Paginated listing for the
// Clientes screen -- `search` is split into words, each matched on name,
// email or id (so "juan perez" works across columns).
export const getCommercePersonsPage = async ({
  schoolId,
  search,
  role,
  page,
  pageSize,
}: ServiceArgs & { search?: string; role?: string; page: number; pageSize: number }): Promise<CommercePersonPage> => {
  const response = await commerceApi.get<CommercePersonPage>(`/schools/${schoolId}/persons/paginated`, {
    params: { search: search || undefined, role: role || undefined, page, page_size: pageSize },
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
