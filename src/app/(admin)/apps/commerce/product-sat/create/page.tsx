import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import ProductSatFormPage from "../ProductSatFormPage";

export const metadata: Metadata = {
  title: "Crear Código SAT - Interschool",
};

export default function CreateProductSatPage() {
  return (
    <>
      <PageTitle
        title="Crear Código SAT"
        items={[
          { label: "Apps" },
          { label: "Comercio" },
          { label: "Códigos SAT", path: "/apps/commerce/product-sat" },
          { label: "Crear", active: true },
        ]}
      />
      <div className="mt-6">
        <ProductSatFormPage />
      </div>
    </>
  );
}
