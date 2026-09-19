"use client";

import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { ProductFormData } from "../hooks";
import { ProductSatRead } from "@/interfaces/IProductSat";
import { getProductSats } from "@/services/productSat.service";

const UNIDAD_MEDIDA_OPTIONS = ["ACT", "E48", "H87"];

interface ProductBasicFieldsProps {
  formData: ProductFormData;
  updateFormField: <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => void;
}

export function ProductBasicFields({ formData, updateFormField }: ProductBasicFieldsProps) {
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
          <span className="label-text">Clave del producto</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={formData.product_key}
          onChange={(e) => updateFormField("product_key", e.target.value)}
          placeholder="Ej. SKU-001"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Título</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={formData.title}
          onChange={(e) => updateFormField("title", e.target.value)}
        />
      </div>

      <div className="form-control md:col-span-2">
        <label className="label">
          <span className="label-text">Descripción</span>
        </label>
        <textarea
          className="textarea textarea-bordered w-full"
          value={formData.description}
          onChange={(e) => updateFormField("description", e.target.value)}
          rows={3}
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Tipo</span>
        </label>
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
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Estatus</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={formData.status}
          onChange={(e) => updateFormField("status", e.target.value as ProductFormData["status"])}
        >
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </select>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Descuento (%)</span>
        </label>
        <input
          type="number"
          min={0}
          max={100}
          className="input input-bordered w-full"
          value={formData.discount}
          onChange={(e) => updateFormField("discount", e.target.value)}
        />
      </div>

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
          {UNIDAD_MEDIDA_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
