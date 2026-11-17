import { useCallback, useEffect, useRef, useState } from "react";

import { CommercePersonRead } from "@/interfaces/ICommercePerson";
import { getOrgConfig } from "@/lib/orgConfig";
import { deleteCommercePerson, getCommercePersonsPage } from "@/services/commercePerson.service";

export const PAGE_SIZE_OPTIONS = [25, 50, 100];
const SEARCH_DEBOUNCE_MS = 350;

// Server-side paginated: schools can have thousands of people, so only one
// page is ever loaded. Search is debounced (one request per pause, not per
// keystroke) and any filter change goes back to page 1.
export const usePersons = () => {
  const [persons, setPersons] = useState<CommercePersonRead[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Only the latest request may update state -- a slow response for an
  // older search must not overwrite a newer one.
  const requestSeq = useRef(0);

  // Any filter change goes back to page 1 in the same render as the filter
  // itself, so there's a single request for the new filter.
  useEffect(() => {
    const next = search.trim();
    if (next === debouncedSearch) return;
    const t = setTimeout(() => {
      setDebouncedSearch(next);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search, debouncedSearch]);

  const changeRole = (value: string) => {
    setRole(value);
    setPage(1);
  };

  const changePageSize = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  const load = useCallback(async () => {
    const seq = ++requestSeq.current;
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const data = await getCommercePersonsPage({
        schoolId,
        search: debouncedSearch || undefined,
        role: role || undefined,
        page,
        pageSize,
      });
      if (seq !== requestSeq.current) return;
      // Deleting the last row of the last page leaves it empty -- step back.
      if (data.items.length === 0 && data.total > 0 && page > 1) {
        setPage(Math.max(1, Math.ceil(data.total / pageSize)));
        return;
      }
      setPersons(data.items);
      setTotal(data.total);
    } catch (err: any) {
      if (seq !== requestSeq.current) return;
      setError(err.response?.data?.detail || err.message || "Error al cargar los clientes");
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, [debouncedSearch, role, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  const removePerson = async (personInternalId: string) => {
    const { schoolId } = getOrgConfig();
    await deleteCommercePerson({ schoolId, personInternalId });
    await load();
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    persons,
    total,
    search,
    setSearch,
    role,
    setRole: changeRole,
    page,
    setPage,
    pageSize,
    setPageSize: changePageSize,
    totalPages,
    loading,
    error,
    removePerson,
    reload: load,
  };
};
