"use client";

import { use } from "react";
import { PageTitle } from "@/components/PageTitle";
import CategoryFormPage from "../CategoryFormPage";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = use(params);

  return (
    <>
      <PageTitle
        title="Editar Categoría"
        items={[
          { label: "Apps" },
          { label: "Comercio" },
          { label: "Categorías", path: "/apps/commerce/categories" },
          { label: "Editar", active: true },
        ]}
      />
      <div className="mt-6">
        <CategoryFormPage categoryId={Number(id)} />
      </div>
    </>
  );
}
