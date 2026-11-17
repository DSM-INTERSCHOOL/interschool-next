import { PageTitle } from "@/components/PageTitle";
import RecargarSaldoPage from "./RecargarSaldoPage";

export default function Page() {
  return (
    <>
      <PageTitle title="Recargar saldo" />
      <div className="mt-6">
        <RecargarSaldoPage />
      </div>
    </>
  );
}
