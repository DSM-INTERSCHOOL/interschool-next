import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { getCommercePerson } from "@/services/commercePerson.service";

// null = unknown (no client, still loading, or the lookup failed) -- the
// "Prepago" payment option only shows once this resolves to a number.
export const useClientBalance = (personInternalId: string | undefined) => {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!personInternalId) {
      setBalance(null);
      return;
    }
    const { schoolId } = getOrgConfig();
    getCommercePerson({ schoolId, personInternalId })
      .then((person) => setBalance(Number(person.balance)))
      .catch(() => setBalance(null));
  }, [personInternalId]);

  return balance;
};
