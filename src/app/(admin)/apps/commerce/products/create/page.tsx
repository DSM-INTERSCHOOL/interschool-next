import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import ProductFormPage from "../ProductFormPage";

export const metadata: Metadata = {
  title: "Crear Producto - Interschool",
};

export default function CreateProductPage() {
  return (
    <>
      <PageTitle
        title="Crear Producto"
      />
      <div className="mt-6">
        <ProductFormPage />
      </div>
    </>
  );
}
