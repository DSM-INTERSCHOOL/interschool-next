"use client";

import { useState } from "react";
import { AppLink as Link } from "@/components/AppLink";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { SpeiInstructionsCard } from "../components/SpeiInstructionsCard";
import { formatDateTime, money } from "../persons/estado-cuenta/components/format";
import { useRecargarSaldo } from "./useRecargarSaldo";

const QUICK_AMOUNTS = [100, 200, 500, 1000];
const MAX_AMOUNT = 100000;

export default function RecargarSaldoPage() {
  const {
    balance,
    pending,
    loading,
    loadError,
    speiEnabled,
    submitting,
    submitError,
    instructions,
    solicitar,
    showInstructions,
    closeInstructions,
  } = useRecargarSaldo();
  const [amount, setAmount] = useState("");

  const numericAmount = Number(amount);
  const validAmount = amount !== "" && numericAmount > 0 && numericAmount <= MAX_AMOUNT;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validAmount || submitting) return;
    await solicitar(Math.round(numericAmount * 100) / 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner message="Cargando..." />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/apps/commerce/orders/self-service" className="btn btn-ghost btn-sm">
          <span className="iconify lucide--arrow-left size-4"></span>
          Volver al autoservicio
        </Link>
      </div>

      {loadError && (
        <div className="alert alert-error">
          <span className="iconify lucide--alert-circle size-5"></span>
          <div>{loadError}</div>
        </div>
      )}

      <div className="card bg-gradient-to-br from-primary to-primary/70 text-primary-content shadow-sm">
        <div className="card-body">
          <p className="opacity-80">Tu saldo prepago</p>
          <p className="text-4xl font-bold">{balance !== null ? money(balance) : "—"}</p>
        </div>
      </div>

      {instructions ? (
        <SpeiInstructionsCard data={instructions} onClose={() => { closeInstructions(); setAmount(""); }} />
      ) : !speiEnabled ? (
        <div className="alert alert-warning">
          <span className="iconify lucide--alert-triangle size-5"></span>
          <div>
            No hay una cuenta SPEI disponible para recibir tu recarga. Acude a la caja para recargar tu saldo.
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body gap-4">
            <div>
              <h2 className="card-title">Recargar por transferencia SPEI</h2>
              <p className="text-sm text-base-content/60">
                Indica el monto y te daremos los datos para hacer la transferencia desde tu banco.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String(q))}
                  className={`btn btn-sm ${numericAmount === q ? "btn-primary" : "btn-outline"}`}
                >
                  {money(q)}
                </button>
              ))}
            </div>

            <label className="form-control w-full">
              <span className="label-text mb-1">Monto</span>
              <label className="input input-bordered flex w-full items-center gap-2">
                <span className="text-base-content/60">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="1"
                  max={MAX_AMOUNT}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="grow"
                />
              </label>
              {amount !== "" && !validAmount && (
                <span className="mt-1 text-sm text-error">
                  Ingresa un monto mayor a $0 y hasta {money(MAX_AMOUNT)}.
                </span>
              )}
            </label>

            {submitError && (
              <div className="alert alert-error text-sm">
                <span className="iconify lucide--alert-circle size-5"></span>
                <div>{submitError}</div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={!validAmount || submitting}>
              {submitting ? <span className="loading loading-spinner loading-sm"></span> : (
                <span className="iconify lucide--landmark size-4"></span>
              )}
              Generar instrucción SPEI
            </button>
          </div>
        </form>
      )}

      {pending.length > 0 && (
        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body gap-3">
            <h2 className="card-title text-base">Recargas pendientes de confirmar</h2>
            <p className="text-sm text-base-content/60">
              Se acreditarán a tu saldo cuando la escuela confirme el depósito.
            </p>
            <ul className="divide-y divide-base-300">
              {pending.map((p) => (
                <li key={p.order_payment_id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="font-semibold">{money(p.amount)}</p>
                    <p className="text-xs text-base-content/60">
                      {formatDateTime(p.created)}
                      {p.reference ? ` · ${p.reference}` : ""}
                    </p>
                  </div>
                  <button type="button" onClick={() => showInstructions(p)} className="btn btn-ghost btn-sm">
                    Ver datos
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
