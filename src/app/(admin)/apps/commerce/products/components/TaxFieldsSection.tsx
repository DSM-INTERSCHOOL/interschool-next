"use client";

import { ProductFormData } from "../hooks";

interface TaxFieldsSectionProps {
  formData: ProductFormData;
  updateFormField: <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => void;
}

// tax=true forces objeto_imp="02" (shown read-only) and reveals tax_base.
// tax=false clears tax_base and lets objeto_imp be picked (01/02); the
// interdependency itself lives in useProductForm.updateFormField.
export function TaxFieldsSection({ formData, updateFormField }: TaxFieldsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="form-control">
        <label className="label cursor-pointer justify-start gap-3">
          <input
            type="checkbox"
            className="checkbox"
            checked={formData.tax}
            onChange={(e) => updateFormField("tax", e.target.checked)}
          />
          <span className="label-text">Aplica impuesto</span>
        </label>
      </div>

      {formData.tax ? (
        <div className="form-control">
          <label className="label">
            <span className="label-text">Base de impuesto (%)</span>
          </label>
          <input
            type="number"
            min={0}
            max={100}
            className="input input-bordered w-full"
            value={formData.tax_base}
            onChange={(e) => updateFormField("tax_base", e.target.value)}
          />
        </div>
      ) : (
        <div className="form-control">
          <label className="label">
            <span className="label-text">Objeto de impuesto</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={formData.objeto_imp}
            onChange={(e) => updateFormField("objeto_imp", e.target.value as ProductFormData["objeto_imp"])}
          >
            <option value="01">01 - No objeto de impuesto</option>
            <option value="02">02 - Sí objeto de impuesto</option>
          </select>
        </div>
      )}

      {formData.tax && (
        <div className="form-control">
          <label className="label">
            <span className="label-text">Objeto de impuesto</span>
          </label>
          <div className="badge badge-lg">02 - Sí objeto de impuesto</div>
        </div>
      )}
    </div>
  );
}
