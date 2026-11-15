"use client";

import { ProductFormData } from "../hooks";

interface ProductBasicFieldsProps {
  formData: ProductFormData;
  updateFormField: <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => void;
}

export function ProductBasicFields({ formData, updateFormField }: ProductBasicFieldsProps) {
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
        <label className="label cursor-pointer justify-start gap-3">
          <input
            type="checkbox"
            className="checkbox"
            checked={formData.track_inventory}
            disabled={formData.type === "KIT"}
            onChange={(e) => updateFormField("track_inventory", e.target.checked)}
          />
          <span className="label-text">Controla inventario</span>
        </label>
        <p className="text-sm text-base-content/60">
          {formData.type === "KIT"
            ? "Un paquete no tiene existencia propia -- se controla por la de sus productos."
            : "Si está activo, la venta de este producto se controla contra existencias."}
        </p>
      </div>
    </div>
  );
}
