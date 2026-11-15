import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import SizeFormPage from "../SizeFormPage";

export const metadata: Metadata = {
  title: "Crear Talla - Interschool",
};

export default function CreateSizePage() {
  return (
    <>
      <PageTitle
        title="Crear Talla"
      />
      <div className="mt-6">
        <SizeFormPage />
      </div>
    </>
  );
}
