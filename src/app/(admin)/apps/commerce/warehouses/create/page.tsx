import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import WarehouseFormPage from "../WarehouseFormPage";

export const metadata: Metadata = {
  title: "Crear Almacén - Interschool",
};

export default function CreateWarehousePage() {
  return (
    <>
      <PageTitle
        title="Crear Almacén"
      />
      <div className="mt-6">
        <WarehouseFormPage />
      </div>
    </>
  );
}
