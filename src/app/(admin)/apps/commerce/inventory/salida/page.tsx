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
      />
      <div className="mt-6">
        <SalidaFormPage />
      </div>
    </>
  );
}
