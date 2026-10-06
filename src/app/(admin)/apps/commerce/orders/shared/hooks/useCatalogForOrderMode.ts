import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { ProductRead } from "@/interfaces/IProduct";
import { ColorRead } from "@/interfaces/IColor";
import { SizeRead } from "@/interfaces/ISize";
import { OrderMode, TopCategoryRead } from "@/interfaces/ITopCategory";
import { getProducts } from "@/services/product.service";
import { getColors } from "@/services/color.service";
import { getSizes } from "@/services/size.service";
import { getTopCategories, getTopCategoryIdsForOrderMode } from "@/services/topCategory.service";

// A top_category with no row in top_category_order_mode for this mode
// genuinely isn't offered here (see the backend's own docstring on that
// table) -- so an empty/unconfigured setup correctly yields zero
// categories, not "show everything", and the UI surfaces that plainly
// rather than silently looking broken. Shared by SELF_SERVICE (the
// kiosk) and OPERATOR (staff order entry) -- same catalog shape, just
// gated by a different order_mode.
export const useCatalogForOrderMode = (orderMode: OrderMode) => {
  const [categories, setCategories] = useState<TopCategoryRead[]>([]);
  const [products, setProducts] = useState<ProductRead[]>([]);
  const [colors, setColors] = useState<ColorRead[]>([]);
  const [sizes, setSizes] = useState<SizeRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);

  useEffect(() => {
    const { schoolId: resolvedSchoolId } = getOrgConfig();
    setSchoolId(resolvedSchoolId);
    if (!resolvedSchoolId) {
      setLoading(false);
      return;
    }

    Promise.all([
      getTopCategories({ schoolId: resolvedSchoolId }),
      getTopCategoryIdsForOrderMode({ schoolId: resolvedSchoolId, orderMode }),
      getProducts({ schoolId: resolvedSchoolId, status: "ACTIVO", limit: 500 }),
      getColors({ schoolId: resolvedSchoolId }),
      getSizes({ schoolId: resolvedSchoolId }),
    ])
      .then(([allCategories, enabledTopCategoryIds, allProducts, colorsData, sizesData]) => {
        const enabledSet = new Set(enabledTopCategoryIds);
        const enabledCategories = allCategories.filter((category) => enabledSet.has(category.id));
        // Only products that actually have a price to charge can be sold
        // here -- a KIT (or any product saved outside the form) can have
        // zero price rows, which would otherwise show an unbuyable tile.
        const sellableProducts = allProducts.filter(
          (product) => enabledSet.has(product.top_category_id ?? -1) && product.prices.length > 0
        );
        setCategories(enabledCategories);
        setProducts(sellableProducts);
        setColors(colorsData);
        setSizes(sizesData);
      })
      .catch((err: any) => {
        setError(err.response?.data?.detail || err.message || "Error al cargar el catálogo");
      })
      .finally(() => setLoading(false));
  }, [orderMode]);

  return { schoolId, categories, products, colors, sizes, loading, error };
};
