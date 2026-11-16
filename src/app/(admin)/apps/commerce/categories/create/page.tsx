import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import CategoryFormPage from "../CategoryFormPage";

export const metadata: Metadata = {
  title: "Crear Clasificador - Interschool",
};

export default function CreateCategoryPage() {
  return (
    <>
      <PageTitle
        title="Crear Clasificador"
      />
      <div className="mt-6">
        <CategoryFormPage />
      </div>
    </>
  );
}
