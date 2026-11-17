import { useEffect, useState } from "react";
import { AppLink as Link } from "@/components/AppLink";
import { getOrgConfig } from "@/lib/orgConfig";
import { getRecargaSpeiDisponible } from "@/services/transaction.service";

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  // "Recargar saldo" only shows when a SPEI top-up can actually be made:
  // the school has a CLABE única, or this buyer has their own CLABE (and
  // the SPEI channel is enabled). Hidden while loading or if the check fails.
  const [canTopUp, setCanTopUp] = useState(false);

  useEffect(() => {
    const { schoolId } = getOrgConfig();
    getRecargaSpeiDisponible({ schoolId })
      .then(setCanTopUp)
      .catch(() => setCanTopUp(false));
  }, []);

  return (
    <div className="flex h-[75vh] min-h-[32rem] w-full flex-col items-center justify-center gap-10 overflow-y-auto rounded-2xl bg-gradient-to-br from-primary to-primary-focus p-8 text-primary-content">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="iconify lucide--utensils-crossed size-20"></span>
        <h1 className="text-5xl font-bold">Bienvenido</h1>
        <p className="text-xl opacity-90">Toca la pantalla para comenzar tu pedido</p>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="btn btn-lg h-auto rounded-3xl bg-base-100 px-16 py-8 text-3xl font-bold text-primary shadow-2xl hover:scale-105 active:scale-95"
      >
        Nueva Orden
      </button>
      {canTopUp && (
        <Link
          href="/apps/commerce/recargar-saldo"
          className="btn btn-ghost btn-lg rounded-3xl border-2 border-primary-content/60 text-primary-content hover:bg-primary-content/10"
        >
          <span className="iconify lucide--wallet size-6"></span>
          Recargar saldo
        </Link>
      )}
    </div>
  );
}
