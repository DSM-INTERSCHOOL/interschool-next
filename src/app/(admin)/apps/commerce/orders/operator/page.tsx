import { PageTitle } from "@/components/PageTitle";
import { OperatorOrderApp } from "./OperatorOrderApp";

export default function Page() {
  return (
    <>
      <PageTitle
        title="Venta por Operador"
      />
      <div className="mt-6">
        <OperatorOrderApp />
      </div>
    </>
  );
}
