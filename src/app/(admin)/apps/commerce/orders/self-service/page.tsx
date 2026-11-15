import { PageTitle } from "@/components/PageTitle";
import { SelfServiceOrderApp } from "./SelfServiceOrderApp";

export default function Page() {
  return (
    <>
      <PageTitle
        title="Autoservicio"
      />
      <div className="mt-6">
        <SelfServiceOrderApp />
      </div>
    </>
  );
}
