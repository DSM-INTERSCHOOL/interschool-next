import { useCallback, useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { CommercePersonRead } from "@/interfaces/ICommercePerson";
import { deleteCommercePerson, getCommercePersons } from "@/services/commercePerson.service";

export const usePersons = () => {
  const [persons, setPersons] = useState<CommercePersonRead[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const data = await getCommercePersons({ schoolId, search: search.trim() || undefined });
      setPersons(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al cargar los clientes");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const removePerson = async (personInternalId: string) => {
    const { schoolId } = getOrgConfig();
    await deleteCommercePerson({ schoolId, personInternalId });
    setPersons((prev) => prev.filter((p) => p.person_internal_id !== personInternalId));
  };

  return { persons, search, setSearch, loading, error, removePerson, reload: load };
};
