import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import PersonFormPage from "../PersonFormPage";

export const metadata: Metadata = {
  title: "Crear Cliente - Interschool",
};

export default function CreatePersonPage() {
  return (
    <>
      <PageTitle
        title="Crear Cliente"
      />
      <div className="mt-6">
        <PersonFormPage />
      </div>
    </>
  );
}
