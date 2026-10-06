import { PageTitle } from "@/components/PageTitle";
import { OperatorOrderApp } from "./OperatorOrderApp";

export default function Page() {
  return (
    <>
      <PageTitle
        title="Venta por Operador"
        items={[{ label: "Apps" }, { label: "Comercio" }, { label: "Venta por Operador", active: true }]}
      />
      <div className="mt-6">
        <OperatorOrderApp />
      </div>
    </>
  );
}
