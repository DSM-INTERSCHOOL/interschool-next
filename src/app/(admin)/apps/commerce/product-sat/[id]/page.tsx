"use client";

import { use } from "react";
import { PageTitle } from "@/components/PageTitle";
import ProductSatFormPage from "../ProductSatFormPage";

interface EditProductSatPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductSatPage({ params }: EditProductSatPageProps) {
  const { id } = use(params);

  return (
    <>
      <PageTitle
        title="Editar Código SAT"
        items={[
          { label: "Apps" },
          { label: "Comercio" },
          { label: "Códigos SAT", path: "/apps/commerce/product-sat" },
          { label: "Editar", active: true },
        ]}
      />
      <div className="mt-6">
        <ProductSatFormPage productSatId={Number(id)} />
      </div>
    </>
  );
}
