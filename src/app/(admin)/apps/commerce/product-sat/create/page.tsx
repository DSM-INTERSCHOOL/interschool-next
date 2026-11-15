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
      />
      <div className="mt-6">
        <ProductSatFormPage />
      </div>
    </>
  );
}
