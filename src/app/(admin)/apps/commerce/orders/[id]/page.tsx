"use client";

import { use } from "react";
import { PageTitle } from "@/components/PageTitle";
import EditOrderPage from "./EditOrderPage";

interface EditOrderRouteProps {
  params: Promise<{ id: string }>;
}

export default function Page({ params }: EditOrderRouteProps) {
  const { id } = use(params);

  return (
    <>
      <PageTitle
        title="Editar Orden"
      />
      <div className="mt-6">
        <EditOrderPage orderId={Number(id)} />
      </div>
    </>
  );
}
