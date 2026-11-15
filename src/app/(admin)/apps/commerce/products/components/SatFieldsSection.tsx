"use client";

import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { UNIDAD_MEDIDA_SAT_OPTIONS } from "@/lib/satCatalogs";
import { ProductFormData } from "../hooks";
import { ProductSatRead } from "@/interfaces/IProductSat";
import { getProductSats } from "@/services/productSat.service";

interface SatFieldsSectionProps {
  formData: ProductFormData;
  updateFormField: <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => void;
}

// Every value here feeds CFDI generation -- the SAT product/unit codes
// identify what was sold, tax/tax_base/objeto_imp how it's taxed.
// tax=true forces objeto_imp="02" (shown read-only) and reveals tax_base.
// tax=false clears tax_base and lets objeto_imp be picked (01/02); the
// interdependency itself lives in useProductForm.updateFormField.
export function SatFieldsSection({ formData, updateFormField }: SatFieldsSectionProps) {
  const [productSats, setProductSats] = useState<ProductSatRead[]>([]);

  useEffect(() => {
    const { schoolId } = getOrgConfig();
    getProductSats({ schoolId })
      .then(setProductSats)
      .catch(() => setProductSats([]));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Clave SAT del producto</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={formData.product_sat_id}
          onChange={(e) =>
            updateFormField("product_sat_id", e.target.value ? Number(e.target.value) : "")
          }
        >
          <option value="">Sin clave SAT</option>
          {productSats.map((productSat) => (
            <option key={productSat.id} value={productSat.id}>
              {productSat.key} - {productSat.description}
            </option>
          ))}
        </select>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Clave unidad de medida SAT</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={formData.clave_unidad_medida_sat}
          onChange={(e) => updateFormField("clave_unidad_medida_sat", e.target.value)}
        >
          <option value="">Sin especificar</option>
          {UNIDAD_MEDIDA_SAT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

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

      {/* Fixed cell regardless of `tax` -- only its content (editable
          select vs. read-only badge) changes, so toggling "Aplica
          impuesto" never moves this field to a different grid position. */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Objeto de impuesto</span>
        </label>
        {formData.tax ? (
          <div className="badge badge-lg">02 - Sí objeto de impuesto</div>
        ) : (
          <select
            className="select select-bordered w-full"
            value={formData.objeto_imp}
            onChange={(e) => updateFormField("objeto_imp", e.target.value as ProductFormData["objeto_imp"])}
          >
            <option value="01">01 - No objeto de impuesto</option>
            <option value="02">02 - Sí objeto de impuesto</option>
          </select>
        )}
      </div>

      {formData.tax && (
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
      )}
    </div>
  );
}
