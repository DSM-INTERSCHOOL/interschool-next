import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { ORDER_MODES, OrderMode, TopCategoryRead } from "@/interfaces/ITopCategory";
import {
  getTopCategories,
  getTopCategoryIdsForOrderMode,
  setTopCategoryIdsForOrderMode,
} from "@/services/topCategory.service";

type EnabledByMode = Record<OrderMode, Set<number>>;

const emptyEnabledByMode = (): EnabledByMode => ({
  SELF_SERVICE: new Set(),
  OPERATOR: new Set(),
});

export const useOrderModesConfig = () => {
  const [categories, setCategories] = useState<TopCategoryRead[]>([]);
  // What's actually saved server-side -- diffed against `enabled` to know
  // which mode(s) need saving and to revert on cancel.
  const [saved, setSaved] = useState<EnabledByMode>(emptyEnabledByMode());
  const [enabled, setEnabled] = useState<EnabledByMode>(emptyEnabledByMode());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { schoolId } = getOrgConfig();
      const [categoriesData, selfServiceIds, operatorIds] = await Promise.all([
        getTopCategories({ schoolId }),
        getTopCategoryIdsForOrderMode({ schoolId, orderMode: "SELF_SERVICE" }),
        getTopCategoryIdsForOrderMode({ schoolId, orderMode: "OPERATOR" }),
      ]);
      const loaded: EnabledByMode = {
        SELF_SERVICE: new Set(selfServiceIds),
        OPERATOR: new Set(operatorIds),
      };
      setCategories(categoriesData);
      setSaved(loaded);
      setEnabled({ SELF_SERVICE: new Set(loaded.SELF_SERVICE), OPERATOR: new Set(loaded.OPERATOR) });
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Error al cargar la configuración");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (orderMode: OrderMode, topCategoryId: number) => {
    setEnabled((prev) => {
      const next = new Set(prev[orderMode]);
      if (next.has(topCategoryId)) next.delete(topCategoryId);
      else next.add(topCategoryId);
      return { ...prev, [orderMode]: next };
    });
  };

  const isDirty = (orderMode: OrderMode) => {
    const a = enabled[orderMode];
    const b = saved[orderMode];
    if (a.size !== b.size) return true;
    for (const id of a) if (!b.has(id)) return true;
    return false;
  };

  const dirty = ORDER_MODES.some((mode) => isDirty(mode.value));

  const save = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      const { schoolId } = getOrgConfig();
      const modesToSave = ORDER_MODES.filter((mode) => isDirty(mode.value));
      await Promise.all(
        modesToSave.map((mode) =>
          setTopCategoryIdsForOrderMode({
            schoolId,
            orderMode: mode.value,
            topCategoryIds: Array.from(enabled[mode.value]),
          })
        )
      );
      setSaved({ SELF_SERVICE: new Set(enabled.SELF_SERVICE), OPERATOR: new Set(enabled.OPERATOR) });
    } catch (err: any) {
      setSaveError(err.response?.data?.detail || err.message || "Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    setEnabled({ SELF_SERVICE: new Set(saved.SELF_SERVICE), OPERATOR: new Set(saved.OPERATOR) });
    setSaveError(null);
  };

  return { categories, enabled, loading, error, saving, saveError, dirty, toggle, save, discard };
};
