import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import TransferenciaFormPage from "../TransferenciaFormPage";

export const metadata: Metadata = {
  title: "Transferencia de Inventario - Interschool",
};

export default function TransferenciaPage() {
  return (
    <>
      <PageTitle
        title="Transferencia de Inventario"
        items={[
          { label: "Apps" },
          { label: "Comercio" },
          { label: "Inventario", path: "/apps/commerce/inventory" },
          { label: "Transferencia", active: true },
        ]}
      />
      <div className="mt-6">
        <TransferenciaFormPage />
      </div>
    </>
  );
}
