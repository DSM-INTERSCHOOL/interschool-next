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
      />
      <div className="mt-6">
        <SizeFormPage sizeId={Number(id)} />
      </div>
    </>
  );
}
