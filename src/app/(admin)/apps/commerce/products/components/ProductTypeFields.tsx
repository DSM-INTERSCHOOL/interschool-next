"use client";

import { ProductRead } from "@/interfaces/IProduct";
import { ProductFormData, SubProductRow } from "../hooks";
import { SubProductPicker } from "./SubProductPicker";

interface ProductTypeFieldsProps {
  formData: ProductFormData;
  updateFormField: <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => void;
  subProductCandidates: ProductRead[];
  subProductsLoading: boolean;
  subProductsError: string | null;
  subProducts: SubProductRow[];
  onAddSubProduct: (row: SubProductRow) => void;
  onRemoveSubProduct: (subProductId: number) => void;
}

// Picking "Paquete" reveals the sub-product picker right here, in the same
// frame as the type choice -- the two are one decision (what this product
// IS), not two separate form sections.
export function ProductTypeFields({
  formData,
  updateFormField,
  subProductCandidates,
  subProductsLoading,
  subProductsError,
  subProducts,
  onAddSubProduct,
  onRemoveSubProduct,
}: ProductTypeFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <label className="label cursor-pointer gap-2">
          <input
            type="radio"
            className="radio"
            checked={formData.type === "SINGLE"}
            onChange={() => updateFormField("type", "SINGLE")}
          />
          <span className="label-text">Producto</span>
        </label>
        <label className="label cursor-pointer gap-2">
          <input
            type="radio"
            className="radio"
            checked={formData.type === "KIT"}
            onChange={() => updateFormField("type", "KIT")}
          />
          <span className="label-text">Paquete</span>
        </label>
      </div>

      {formData.type === "KIT" && (
        <SubProductPicker
          candidates={subProductCandidates}
          loading={subProductsLoading}
          error={subProductsError}
          subProducts={subProducts}
          onAdd={onAddSubProduct}
          onRemove={onRemoveSubProduct}
        />
      )}
    </div>
  );
}
