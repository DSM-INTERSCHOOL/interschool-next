"use client";

import { use } from "react";
import { PageTitle } from "@/components/PageTitle";
import WarehouseFormPage from "../WarehouseFormPage";

interface EditWarehousePageProps {
  params: Promise<{ id: string }>;
}

export default function EditWarehousePage({ params }: EditWarehousePageProps) {
  const { id } = use(params);

  return (
    <>
      <PageTitle
        title="Editar Almacén"
        items={[
          { label: "Apps" },
          { label: "Comercio" },
          { label: "Almacenes", path: "/apps/commerce/warehouses" },
          { label: "Editar", active: true },
        ]}
      />
      <div className="mt-6">
        <WarehouseFormPage warehouseId={Number(id)} />
      </div>
    </>
  );
}
