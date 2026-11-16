"use client";

import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { ChipMultiSelect } from "../../components";
import { getTopCategories } from "@/services/topCategory.service";
import { getCategories } from "@/services/category.service";
import { TopCategoryRead } from "@/interfaces/ITopCategory";
import { CategoryRead } from "@/interfaces/ICategory";
import { ProductFormData } from "../hooks";

interface ProductCategoryFieldsProps {
  formData: ProductFormData;
  updateFormField: <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => void;
}

// Both fields apply to a product regardless of type -- category_ids is
// just a tag (ProductCategory, many-to-many), unlike color_ids/size_ids
// which are genuinely variant-only and stay SINGLE-only.
export function ProductCategoryFields({ formData, updateFormField }: ProductCategoryFieldsProps) {
  const [topCategories, setTopCategories] = useState<TopCategoryRead[]>([]);
  const [categories, setCategories] = useState<CategoryRead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { schoolId } = getOrgConfig();
    Promise.all([getTopCategories({ schoolId }), getCategories({ schoolId })])
      .then(([topCategoriesData, categoriesData]) => {
        setTopCategories(topCategoriesData);
        setCategories(categoriesData);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="form-control md:w-1/2">
        <label className="label">
          <span className="label-text">Categoría</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={formData.top_category_id}
          onChange={(e) =>
            updateFormField("top_category_id", e.target.value ? Number(e.target.value) : "")
          }
        >
          <option value="">Sin categoría</option>
          {topCategories.map((topCategory) => (
            <option key={topCategory.id} value={topCategory.id}>
              {topCategory.description}
            </option>
          ))}
        </select>
      </div>

      <ChipMultiSelect
        label="Clasificadores"
        options={categories.map((category) => ({ id: category.id, label: category.description }))}
        selectedIds={formData.category_ids}
        onChange={(ids) => updateFormField("category_ids", ids)}
        loading={loading}
        emptyMessage="No hay clasificadores registrados."
      />
    </div>
  );
}
