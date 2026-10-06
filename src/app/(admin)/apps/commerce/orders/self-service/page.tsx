import { PageTitle } from "@/components/PageTitle";
import { SelfServiceOrderApp } from "./SelfServiceOrderApp";

export default function Page() {
  return (
    <>
      <PageTitle
        title="Autoservicio"
        items={[{ label: "Apps" }, { label: "Comercio" }, { label: "Autoservicio", active: true }]}
      />
      <div className="mt-6">
        <SelfServiceOrderApp />
      </div>
    </>
  );
}
