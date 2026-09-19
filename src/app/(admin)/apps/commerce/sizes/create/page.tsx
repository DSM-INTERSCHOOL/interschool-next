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
        items={[
          { label: "Apps" },
          { label: "Comercio" },
          { label: "Tallas", path: "/apps/commerce/sizes" },
          { label: "Crear", active: true },
        ]}
      />
      <div className="mt-6">
        <SizeFormPage />
      </div>
    </>
  );
}
