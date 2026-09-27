"use client";

import { use } from "react";
import { PageTitle } from "@/components/PageTitle";
import TopCategoryFormPage from "../TopCategoryFormPage";

interface EditTopCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default function EditTopCategoryPage({ params }: EditTopCategoryPageProps) {
  const { id } = use(params);

  return (
    <>
      <PageTitle
        title="Editar Clasificador"
        items={[
          { label: "Apps" },
          { label: "Comercio" },
          { label: "Clasificadores", path: "/apps/commerce/top-categories" },
          { label: "Editar", active: true },
        ]}
      />
      <div className="mt-6">
        <TopCategoryFormPage topCategoryId={Number(id)} />
      </div>
    </>
  );
}
