import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import EntradaFormPage from "../EntradaFormPage";

export const metadata: Metadata = {
  title: "Entrada de Inventario - Interschool",
};

export default function EntradaPage() {
  return (
    <>
      <PageTitle
        title="Entrada de Inventario"
        items={[
          { label: "Apps" },
          { label: "Comercio" },
          { label: "Inventario", path: "/apps/commerce/inventory" },
          { label: "Entrada", active: true },
        ]}
      />
      <div className="mt-6">
        <EntradaFormPage />
      </div>
    </>
  );
}
