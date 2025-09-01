"use client";

import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import { ConsultaApp } from "./ConsultaApp";

export default function ConsultaPage() {
  return (
    <>
      <PageTitle
        title="Consulta"
        items={[
          { label: "Apps" },
          { label: "Pases de Salida" },
          { label: "Consulta", active: true }
        ]}
      />
      <ConsultaApp />
    </>
  );
}
