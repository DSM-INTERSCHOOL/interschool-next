"use client";

import { AppLink as Link } from "@/components/AppLink";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  ProductBasicFields,
  ProductCategoryFields,
  ProductPictureManager,
  ProductTypeFields,
  SatFieldsSection,
  SingleProductFields,
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
        <div className="card-body gap-6">
          {error && (
            <div className="alert alert-error">
              <span className="iconify lucide--alert-circle size-6"></span>
              <div>{error}</div>
            </div>
          )}
          {saveError && (
            <div className="alert alert-error">
              <span className="iconify lucide--alert-circle size-6"></span>
              <div>{saveError}</div>
            </div>
          )}

          <div className="rounded-xl border border-base-300 p-4">
            <p className="mb-3 font-semibold">Información general</p>
            <ProductBasicFields formData={formData} updateFormField={updateFormField} />
          </div>

          <div className="rounded-xl border border-base-300 p-4">
            <p className="mb-3 font-semibold">Tipo</p>
            <ProductTypeFields
              formData={formData}
              updateFormField={updateFormField}
              subProductCandidates={subProductCatalog.candidates}
              subProductsLoading={subProductCatalog.loading}
              subProductsError={subProductCatalog.error}
              subProducts={subProducts}
              onAddSubProduct={addSubProduct}
              onRemoveSubProduct={removeSubProduct}
            />
          </div>

          <div className="rounded-xl border border-base-300 p-4">
            <p className="mb-3 font-semibold">Categoría y Clasificador</p>
            <ProductCategoryFields formData={formData} updateFormField={updateFormField} />
          </div>

          <div className="rounded-xl border border-base-300 p-4">
            <p className="mb-3 font-semibold">Datos fiscales (SAT)</p>
            <SatFieldsSection formData={formData} updateFormField={updateFormField} />
          </div>

          {formData.type === "SINGLE" && (
            <div className="rounded-xl border border-base-300 p-4">
              <p className="mb-3 font-semibold">Variantes y precios</p>
              <SingleProductFields
                colorIds={formData.color_ids}
                sizeIds={formData.size_ids}
                onColorsChange={(ids) => updateFormField("color_ids", ids)}
                onSizesChange={(ids) => updateFormField("size_ids", ids)}
                priceRows={priceMatrix.rows}
                onPriceChange={priceMatrix.setCellValue}
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
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
