"use client";

import { use } from "react";
import { AppLink as Link } from "@/components/AppLink";
import { PageTitle } from "@/components/PageTitle";
import PersonFormPage from "../PersonFormPage";

interface EditPersonPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPersonPage({ params }: EditPersonPageProps) {
  const { id } = use(params);

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <PageTitle
          title="Editar Cliente"
        />
        <Link href="/apps/commerce/persons" className="btn btn-ghost btn-sm">
          <span className="iconify lucide--arrow-left size-4"></span>
          Volver a Clientes
        </Link>
      </div>
      <div className="mt-6">
        <PersonFormPage personInternalId={decodeURIComponent(id)} />
      </div>
    </>
  );
}
