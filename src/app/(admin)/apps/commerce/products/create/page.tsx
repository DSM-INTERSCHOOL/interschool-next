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
        items={[
          { label: "Apps" },
          { label: "Comercio" },
          { label: "Productos", path: "/apps/commerce/products" },
          { label: "Crear", active: true },
        ]}
      />
      <div className="mt-6">
        <ProductFormPage />
      </div>
    </>
  );
}
