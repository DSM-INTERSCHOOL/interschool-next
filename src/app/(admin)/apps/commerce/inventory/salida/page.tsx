import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import SalidaFormPage from "../SalidaFormPage";

export const metadata: Metadata = {
  title: "Salida de Inventario - Interschool",
};

export default function SalidaPage() {
  return (
    <>
      <PageTitle
        title="Salida de Inventario"
        items={[
          { label: "Apps" },
          { label: "Comercio" },
          { label: "Inventario", path: "/apps/commerce/inventory" },
          { label: "Salida", active: true },
        ]}
      />
      <div className="mt-6">
        <SalidaFormPage />
      </div>
    </>
  );
}
