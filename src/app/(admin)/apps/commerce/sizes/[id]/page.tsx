"use client";

import { use } from "react";
import { PageTitle } from "@/components/PageTitle";
import SizeFormPage from "../SizeFormPage";

interface EditSizePageProps {
  params: Promise<{ id: string }>;
}

export default function EditSizePage({ params }: EditSizePageProps) {
  const { id } = use(params);

  return (
    <>
      <PageTitle
        title="Editar Talla"
        items={[
          { label: "Apps" },
          { label: "Comercio" },
          { label: "Tallas", path: "/apps/commerce/sizes" },
          { label: "Editar", active: true },
        ]}
      />
      <div className="mt-6">
        <SizeFormPage sizeId={Number(id)} />
      </div>
    </>
  );
}
