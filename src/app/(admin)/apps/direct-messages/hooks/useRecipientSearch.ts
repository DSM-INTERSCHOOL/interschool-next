"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { searchRecipients, RecipientCandidate } from "@/services/directMessage.service";
import { getSchool } from "@/services/auth.service";
import { getOrgConfig } from "@/lib/orgConfig";
import { useAuthStore } from "@/store/useAuthStore";

const SENDER_TYPE_NORMALIZE: Record<string, string> = {
  usuario: "USER", teacher: "TEACHER", student: "STUDENT",
  relative: "RELATIVE", academico: "ACADEMIC",
};

export const useRecipientSearch = () => {
  const personId   = useAuthStore((s) => s.personId);
  const personType = useAuthStore((s) => s.personType);

  const [allowedTypes, setAllowedTypes]   = useState<string[]>([]);
  const [activeType, setActiveType]       = useState<string>("Todos");
  const [searchTerm, setSearchTerm]       = useState("");
  const [results, setResults]             = useState<RecipientCandidate[]>([]);
  const [searching, setSearching]         = useState(false);
  const [hasSearched, setHasSearched]     = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load allowed recipient types from school config
  useEffect(() => {
    const load = async () => {
      const { schoolId } = getOrgConfig();
      if (!schoolId || !personType) return;
      try {
        const school = await getSchool(schoolId);
        const recipientsConfig = school.inoty_config?.inoty_recipients_config ?? {};
        const normalized = SENDER_TYPE_NORMALIZE[personType.toLowerCase()] ?? personType.toUpperCase();
        const targetsMap = recipientsConfig[normalized] ?? {};
        const types = Object.entries(targetsMap)
          .filter(([, scope]) => scope !== "NONE" && scope !== null)
          .map(([t]) => t.toUpperCase());
        setAllowedTypes(types.length ? types : ["USER", "STUDENT", "TEACHER", "RELATIVE"]);
      } catch {
        setAllowedTypes(["USER", "STUDENT", "TEACHER", "RELATIVE"]);
      }
    };
    load();
  }, [personType]);

  const doSearch = useCallback(async (term: string, type: string) => {
    const { schoolId } = getOrgConfig();
    if (!schoolId || !personId || !personType) return;
    if (!term.trim()) { setResults([]); setHasSearched(false); return; }
    try {
      setSearching(true);
      const target = type === "Todos" ? undefined : type;
      const data = await searchRecipients(schoolId, personId, personType, term, target);
      setResults(data);
      setHasSearched(true);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [personId, personType]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(term, activeType), 400);
  };

  const handleTypeChange = (type: string) => {
    setActiveType(type);
    if (searchTerm.trim()) doSearch(searchTerm, type);
  };

  const reset = () => {
    setSearchTerm("");
    setResults([]);
    setHasSearched(false);
    setActiveType("Todos");
  };

  return { allowedTypes, activeType, searchTerm, results, searching, hasSearched,
    handleSearchChange, handleTypeChange, reset };
};
