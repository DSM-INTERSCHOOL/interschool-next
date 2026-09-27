import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import TopCategoryFormPage from "../TopCategoryFormPage";

export const metadata: Metadata = {
  title: "Crear Clasificador - Interschool",
};

export default function CreateTopCategoryPage() {
  return (
    <>
      <PageTitle
        title="Crear Clasificador"
        items={[
          { label: "Apps" },
          { label: "Comercio" },
          { label: "Clasificadores", path: "/apps/commerce/top-categories" },
          { label: "Crear", active: true },
        ]}
      />
      <div className="mt-6">
        <TopCategoryFormPage />
      </div>
    </>
  );
}
