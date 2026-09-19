import { useEffect, useRef, useState } from "react";
import { useAppRouter as useRouter } from "@/hooks/useAppRouter";
import { getOrgConfig } from "@/lib/orgConfig";
import {
  ObjetoImp,
  ProductCreate,
  ProductRead,
  ProductStatus,
  ProductSubProductInput,
  ProductType,
  ProductUpdate,
} from "@/interfaces/IProduct";
import { createProduct, getProduct, updateProduct } from "@/services/product.service";
import { usePriceMatrix } from "./usePriceMatrix";
import { useSubProductCatalog } from "./useSubProductCatalog";

export interface ProductFormData {
  product_key: string;
  title: string;
  description: string;
  type: ProductType;
  status: ProductStatus;
  discount: string;
  tax: boolean;
  tax_base: string;
  product_sat_id: number | "";
  clave_unidad_medida_sat: string;
  objeto_imp: ObjetoImp;
  color_ids: number[];
  size_ids: number[];
  category_ids: number[];
}

export interface SubProductRow extends ProductSubProductInput {
  _title: string;
}

const emptyFormData: ProductFormData = {
  product_key: "",
  title: "",
  description: "",
  type: "SINGLE",
  status: "ACTIVO",
  discount: "0",
  tax: false,
  tax_base: "",
  product_sat_id: "",
  clave_unidad_medida_sat: "",
  objeto_imp: "01",
  color_ids: [],
  size_ids: [],
  category_ids: [],
};

export const useProductForm = (productId?: number) => {
  const router = useRouter();

  const [formData, setFormData] = useState<ProductFormData>(emptyFormData);
  const [subProducts, setSubProducts] = useState<SubProductRow[]>([]);
  const [loadedProduct, setLoadedProduct] = useState<ProductRead | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const priceMatrix = usePriceMatrix({
    sizeIds: formData.size_ids,
    colorIds: formData.color_ids,
    initialPrices: loadedProduct?.prices,
  });
  const subProductCatalog = useSubProductCatalog();
  const seededSubProductsRef = useRef(false);

  useEffect(() => {
    if (!productId) return;
    const load = async () => {
      try {
        setLoading(true);
        const { schoolId } = getOrgConfig();
        const product = await getProduct({ schoolId, productId });
        setLoadedProduct(product);
        setFormData({
          product_key: product.product_key ?? "",
          title: product.title,
          description: product.description,
          type: product.type,
          status: product.status,
          discount: String(product.discount),
          tax: product.tax,
          tax_base: product.tax_base !== null ? String(product.tax_base) : "",
          product_sat_id: product.product_sat_id ?? "",
          clave_unidad_medida_sat: product.clave_unidad_medida_sat ?? "",
          objeto_imp: product.objeto_imp ?? "01",
          color_ids: product.color_ids,
          size_ids: product.size_ids,
          category_ids: product.category_ids,
        });
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || "Error al cargar el producto");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId]);

  // Seed sub-product rows once both the product and the candidate catalog
  // (used to resolve display titles) have settled.
  useEffect(() => {
    if (seededSubProductsRef.current || !loadedProduct || subProductCatalog.loading) return;
    seededSubProductsRef.current = true;
    if (loadedProduct.sub_products.length === 0) return;
    setSubProducts(
      loadedProduct.sub_products.map((sp) => {
        const candidate = subProductCatalog.candidates.find((c) => c.id === sp.sub_product_id);
        return {
          sub_product_id: sp.sub_product_id,
          quantity: sp.quantity,
          _title: candidate?.title ?? `Producto #${sp.sub_product_id}`,
        };
      })
    );
  }, [loadedProduct, subProductCatalog.loading, subProductCatalog.candidates]);

  const updateFormField = <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "tax") {
        if (value) {
          next.objeto_imp = "02";
        } else {
          next.tax_base = "";
        }
      }
      return next;
    });
  };

  const addSubProduct = (row: SubProductRow) => {
    setSubProducts((prev) =>
      prev.some((existing) => existing.sub_product_id === row.sub_product_id) ? prev : [...prev, row]
    );
  };

  const removeSubProduct = (subProductId: number) => {
    setSubProducts((prev) => prev.filter((row) => row.sub_product_id !== subProductId));
  };

  const validate = (): boolean => {
    if (!formData.title.trim()) {
      setSaveError("El título es requerido");
      return false;
    }
    if (!formData.description.trim()) {
      setSaveError("La descripción es requerida");
      return false;
    }
    if (formData.type === "SINGLE" && !priceMatrix.isComplete()) {
      setSaveError("Todos los precios deben estar completos");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      setSaveError(null);
      if (!validate()) return;

      const { schoolId } = getOrgConfig();
      const isEdit = Boolean(productId);
      const isSingle = formData.type === "SINGLE";

      const basePayload = {
        product_key: formData.product_key.trim() || undefined,
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        status: formData.status,
        discount: Number(formData.discount) || 0,
        tax: formData.tax,
        tax_base: formData.tax_base !== "" ? Number(formData.tax_base) : undefined,
        product_sat_id: formData.product_sat_id !== "" ? Number(formData.product_sat_id) : undefined,
        clave_unidad_medida_sat: formData.clave_unidad_medida_sat.trim() || undefined,
        objeto_imp: formData.objeto_imp,
      };

      const variantPayload = isSingle
        ? { color_ids: formData.color_ids, size_ids: formData.size_ids, category_ids: formData.category_ids }
        : { color_ids: [], size_ids: [], category_ids: [] };

      const subProductsPayload: ProductSubProductInput[] = !isSingle
        ? subProducts.map(({ sub_product_id, quantity }) => ({ sub_product_id, quantity }))
        : [];

      if (isEdit) {
        // A product switching from SINGLE to KIT (or just no longer needing
        // prices) drops every existing price -- nothing in the backend gives
        // a KIT its own price row.
        const priceFields = isSingle
          ? priceMatrix.buildDiff(true)
          : {
              prices_to_add: [] as never[],
              price_ids_to_remove: (loadedProduct?.prices ?? []).map((price) => price.id),
            };

        const dto: ProductUpdate = {
          ...basePayload,
          ...variantPayload,
          sub_products: subProductsPayload,
          ...priceFields,
        };
        await updateProduct({ schoolId, productId: productId!, dto });
        router.push("/apps/commerce/products");
      } else {
        const priceFields = isSingle ? priceMatrix.buildDiff(false) : { prices: [] };
        const dto = {
          ...basePayload,
          ...variantPayload,
          sub_products: subProductsPayload,
          ...priceFields,
        } as ProductCreate;
        const result = await createProduct({ schoolId, dto });
        router.push(`/apps/commerce/products/${result.id}`);
      }
    } catch (err: any) {
      setSaveError(err.response?.data?.detail || err.message || "Error al guardar el producto");
    } finally {
      setSaveLoading(false);
    }
  };

  return {
    formData,
    updateFormField,
    subProducts,
    addSubProduct,
    removeSubProduct,
    subProductCatalog,
    loadedProduct,
    priceMatrix,
    loading,
    saveLoading,
    error,
    saveError,
    handleSave,
  };
};
