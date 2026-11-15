import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import CapturaFormPage from "../CapturaFormPage";

export const metadata: Metadata = {
  title: "Captura de Inventario - Interschool",
};

export default function CapturaPage() {
  return (
    <>
      <PageTitle
        title="Captura de Inventario"
      />
      <div className="mt-6">
        <CapturaFormPage />
      </div>
    </>
  );
}
