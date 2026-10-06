import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { CommercePersonRead } from "@/interfaces/ICommercePerson";
import { getCommercePersons } from "@/services/commercePerson.service";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

export const usePersonSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CommercePersonRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    const { schoolId } = getOrgConfig();
    const timer = setTimeout(() => {
      getCommercePersons({ schoolId, search: trimmed })
        .then(setResults)
        .catch((err: any) => {
          setError(err.response?.data?.detail || err.message || "No se pudo buscar el cliente");
        })
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  return { query, setQuery, results, loading, error };
};
