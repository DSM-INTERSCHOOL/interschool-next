import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import WarehouseKardexPage from "../WarehouseKardexPage";

export const metadata: Metadata = {
  title: "Kardex de Almacén - Interschool",
};

export default function KardexAlmacenRoutePage() {
  return (
    <>
      <PageTitle
        title="Kardex de Almacén"
      />
      <div className="mt-6">
        <WarehouseKardexPage />
      </div>
    </>
  );
}
