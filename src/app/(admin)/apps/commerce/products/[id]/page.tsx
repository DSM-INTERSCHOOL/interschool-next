"use client";

import { use } from "react";
import { PageTitle } from "@/components/PageTitle";
import ProductFormPage from "../ProductFormPage";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);

  return (
    <>
      <PageTitle
        title="Editar Producto"
      />
      <div className="mt-6">
        <ProductFormPage productId={Number(id)} />
      </div>
    </>
  );
}
