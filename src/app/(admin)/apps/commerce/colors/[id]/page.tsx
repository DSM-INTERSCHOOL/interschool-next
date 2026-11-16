"use client";

import { use } from "react";
import { PageTitle } from "@/components/PageTitle";
import ColorFormPage from "../ColorFormPage";

interface EditColorPageProps {
  params: Promise<{ id: string }>;
}

export default function EditColorPage({ params }: EditColorPageProps) {
  const { id } = use(params);

  return (
    <>
      <PageTitle
        title="Editar Color"
      />
      <div className="mt-6">
        <ColorFormPage colorId={Number(id)} />
      </div>
    </>
  );
}
