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
      />
      <div className="mt-6">
        <ProductSatFormPage productSatId={Number(id)} />
      </div>
    </>
  );
}
