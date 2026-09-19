import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import ColorFormPage from "../ColorFormPage";

export const metadata: Metadata = {
  title: "Crear Color - Interschool",
};

export default function CreateColorPage() {
  return (
    <>
      <PageTitle
        title="Crear Color"
        items={[
          { label: "Apps" },
          { label: "Comercio" },
          { label: "Colores", path: "/apps/commerce/colors" },
          { label: "Crear", active: true },
        ]}
      />
      <div className="mt-6">
        <ColorFormPage />
      </div>
    </>
  );
}
