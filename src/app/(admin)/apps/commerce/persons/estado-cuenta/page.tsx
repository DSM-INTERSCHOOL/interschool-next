import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import EstadoCuentaPage from "./EstadoCuentaPage";

export const metadata: Metadata = {
  title: "Estado de cuenta - Interschool",
};

export default function EstadoCuentaRoutePage() {
  return (
    <>
      <PageTitle title="Estado de cuenta" />
      <div className="mt-6">
        <EstadoCuentaPage />
      </div>
    </>
  );
}
