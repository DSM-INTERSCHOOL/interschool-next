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
        items={[
          { label: "Apps" },
          { label: "Comercio" },
          { label: "Almacenes", path: "/apps/commerce/warehouses" },
          { label: "Crear", active: true },
        ]}
      />
      <div className="mt-6">
        <WarehouseFormPage />
      </div>
    </>
  );
}
