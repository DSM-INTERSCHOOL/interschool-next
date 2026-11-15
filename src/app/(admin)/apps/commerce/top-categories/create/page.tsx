import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import TopCategoryFormPage from "../TopCategoryFormPage";

export const metadata: Metadata = {
  title: "Crear Categoría - Interschool",
};

export default function CreateTopCategoryPage() {
  return (
    <>
      <PageTitle
        title="Crear Categoría"
      />
      <div className="mt-6">
        <TopCategoryFormPage />
      </div>
    </>
  );
}
