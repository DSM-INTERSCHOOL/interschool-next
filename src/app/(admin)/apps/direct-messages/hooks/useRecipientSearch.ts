"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { searchRecipients, RecipientCandidate } from "@/services/directMessage.service";
import { getOrgConfig } from "@/lib/orgConfig";
import { useAuthStore } from "@/store/useAuthStore";
import { useSchoolStore } from "@/store/useSchoolStore";

export const PAGE_LIMIT = 20;

export const useRecipientSearch = () => {
  const personId   = useAuthStore((s) => s.personId);
  const personType = useAuthStore((s) => s.personType);
  const school      = useSchoolStore((s) => s.school);

  const allowedTypes = useMemo(() => {
    if (!personType || !school?.inoty_config?.inoty_recipients_config) return [];
    const targetsMap = school.inoty_config.inoty_recipients_config[personType] ?? {};
    return Object.entries(targetsMap)
      .filter(([, scope]) => scope !== "NONE" && scope !== null)
      .map(([t]) => t);
  }, [personType, school]);

  const [activeType, setActiveType]       = useState<string>("Todos");
  const [searchTerm, setSearchTerm]       = useState("");
  const [results, setResults]             = useState<RecipientCandidate[]>([]);
  const [total, setTotal]                 = useState(0);
  const [skip, setSkip]                   = useState(0);
  const [searching, setSearching]         = useState(false);
  const [hasSearched, setHasSearched]     = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  const prevTypeRef = useRef<string | undefined>(undefined);
  const prevSkipRef = useRef(0);

  const fetchRecipients = useCallback(async (type: string, term: string, currentSkip: number) => {
    const { schoolId } = getOrgConfig();
    if (!schoolId || !personId || !personType) return;
    try {
      setSearching(true);
      setError(null);
      const target = type === "Todos" ? undefined : type;
      const data = await searchRecipients(schoolId, personId, personType, term, target, currentSkip, PAGE_LIMIT);
      setResults(data.items);
      setTotal(data.total);
      setHasSearched(true);
    } catch {
      setError("Error al cargar destinatarios");
      setResults([]);
      setTotal(0);
      setHasSearched(true);
    } finally {
      setSearching(false);
    }
  }, [personId, personType]);

  // Same pattern as appointment recipients: type/page changes fetch immediately,
  // text changes debounce 400ms. Waits for allowedTypes before the first fetch.
  useEffect(() => {
    if (allowedTypes.length === 0) return;
    const typeChanged = prevTypeRef.current !== activeType;
    const skipChanged = prevSkipRef.current !== skip;
    prevTypeRef.current = activeType;
    prevSkipRef.current = skip;
    const delay = typeChanged || skipChanged ? 0 : 400;
    const timer = setTimeout(() => fetchRecipients(activeType, searchTerm, skip), delay);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedTypes, activeType, searchTerm, skip, fetchRecipients]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setSkip(0);
  };

  const handleTypeChange = (type: string) => {
    setActiveType(type);
    setSkip(0);
  };

  const reset = () => {
    setSearchTerm("");
    setResults([]);
    setTotal(0);
    setSkip(0);
    setHasSearched(false);
    setActiveType("Todos");
    prevTypeRef.current = undefined;
    prevSkipRef.current = 0;
  };

  const hasPrev = skip > 0;
  const hasNext = skip + PAGE_LIMIT < total;
  const totalPages = Math.ceil(total / PAGE_LIMIT);
  const currentPage = Math.floor(skip / PAGE_LIMIT) + 1;

  return {
    allowedTypes, activeType, searchTerm, results, total, skip, setSkip,
    searching, hasSearched, error,
    hasPrev, hasNext, totalPages, currentPage,
    handleSearchChange, handleTypeChange, reset,
  };
};
