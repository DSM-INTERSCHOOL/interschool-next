import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import CategoryFormPage from "../CategoryFormPage";

export const metadata: Metadata = {
  title: "Crear Categoría - Interschool",
};

export default function CreateCategoryPage() {
  return (
    <>
      <PageTitle
        title="Crear Categoría"
        items={[
          { label: "Apps" },
          { label: "Comercio" },
          { label: "Categorías", path: "/apps/commerce/categories" },
          { label: "Crear", active: true },
        ]}
      />
      <div className="mt-6">
        <CategoryFormPage />
      </div>
    </>
  );
}
