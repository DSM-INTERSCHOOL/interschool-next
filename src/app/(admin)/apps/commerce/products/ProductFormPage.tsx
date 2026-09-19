"use client";

import { AppLink as Link } from "@/components/AppLink";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  ProductBasicFields,
  ProductPictureManager,
  SingleProductFields,
  SubProductPicker,
  TaxFieldsSection,
} from "./components";
import { useProductForm } from "./hooks";

interface ProductFormPageProps {
  productId?: number;
}

export default function ProductFormPage({ productId }: ProductFormPageProps) {
  const {
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
  } = useProductForm(productId);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner message="Cargando producto..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          {error && (
            <div className="alert alert-error mb-4">
              <span className="iconify lucide--alert-circle size-6"></span>
              <div>{error}</div>
            </div>
          )}
          {saveError && (
            <div className="alert alert-error mb-4">
              <span className="iconify lucide--alert-circle size-6"></span>
              <div>{saveError}</div>
            </div>
          )}

          <ProductBasicFields formData={formData} updateFormField={updateFormField} />

          <div className="divider"></div>
          <TaxFieldsSection formData={formData} updateFormField={updateFormField} />

          <div className="divider"></div>
          {formData.type === "SINGLE" ? (
            <SingleProductFields
              colorIds={formData.color_ids}
              sizeIds={formData.size_ids}
              categoryIds={formData.category_ids}
              onColorsChange={(ids) => updateFormField("color_ids", ids)}
              onSizesChange={(ids) => updateFormField("size_ids", ids)}
              onCategoriesChange={(ids) => updateFormField("category_ids", ids)}
              priceRows={priceMatrix.rows}
              onPriceChange={priceMatrix.setCellValue}
            />
          ) : (
            <SubProductPicker
              candidates={subProductCatalog.candidates}
              loading={subProductCatalog.loading}
              error={subProductCatalog.error}
              subProducts={subProducts}
              onAdd={addSubProduct}
              onRemove={removeSubProduct}
            />
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Link href="/apps/commerce/products" className="btn btn-ghost">
              Cancelar
            </Link>
            <button className="btn btn-primary" onClick={handleSave} disabled={saveLoading}>
              {saveLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : productId ? (
                "Actualizar"
              ) : (
                "Guardar"
              )}
            </button>
          </div>
        </div>
      </div>

      {productId && loadedProduct && (
        <ProductPictureManager
          productId={productId}
          initialPictures={loadedProduct.pictures}
          initialThumbnail={loadedProduct.thumbnail}
        />
      )}
    </div>
  );
}
