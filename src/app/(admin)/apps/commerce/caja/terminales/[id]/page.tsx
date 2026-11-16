"use client";

import { use } from "react";
import { PageTitle } from "@/components/PageTitle";
import TerminalFormPage from "../TerminalFormPage";

interface EditTerminalPageProps {
  params: Promise<{ id: string }>;
}

export default function EditTerminalPage({ params }: EditTerminalPageProps) {
  const { id } = use(params);

  return (
    <>
      <PageTitle
        title="Editar Terminal"
      />
      <div className="mt-6">
        <TerminalFormPage terminalId={Number(id)} />
      </div>
    </>
  );
}
