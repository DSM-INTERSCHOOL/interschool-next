import type { Metadata } from "next";
import { PageTitle } from "@/components/PageTitle";
import TerminalFormPage from "../TerminalFormPage";

export const metadata: Metadata = {
  title: "Crear Terminal - Interschool",
};

export default function CreateTerminalPage() {
  return (
    <>
      <PageTitle
        title="Crear Terminal"
      />
      <div className="mt-6">
        <TerminalFormPage />
      </div>
    </>
  );
}
