import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { getCommerceConfig } from "@/services/commerceConfig.service";
import { getWarehouses } from "@/services/warehouse.service";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";

// Resolves the same warehouse OrderingScreen's stock checks and the
// backend's own checkout actually use for OPERATOR sales (see
// warehouse_resolution.resolve_for_sale_warehouse): CommerceConfig's
// operator_warehouse_id when set, else whichever warehouse is marked
// for_sale. Display-only -- just so the person running the till can tell
// which physical warehouse this screen is selling from.
export const useSaleWarehouseLabel = () => {
  const [label, setLabel] = useState<string | null>(null);

  const load = () => {
    const { schoolId } = getOrgConfig();
    Promise.all([getCommerceConfig({ schoolId }), getWarehouses({ schoolId })])
      .then(([config, warehouses]) => {
        const preferred = config.operator_warehouse_id
          ? warehouses.find((w) => w.id === config.operator_warehouse_id)
          : undefined;
        const resolved = preferred ?? warehouses.find((w) => w.for_sale);
        setLabel(resolved?.description ?? null);
      })
      .catch(() => setLabel(null));
  };

  useEffect(load, []);
  useRefetchOnFocus(load);

  return label;
};
