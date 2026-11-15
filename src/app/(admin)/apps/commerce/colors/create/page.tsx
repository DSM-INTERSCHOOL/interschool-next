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
      />
      <div className="mt-6">
        <ColorFormPage />
      </div>
    </>
  );
}
