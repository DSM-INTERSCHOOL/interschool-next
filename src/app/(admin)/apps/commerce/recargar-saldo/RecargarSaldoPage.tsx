"use client";

import { useState } from "react";
import { AppLink as Link } from "@/components/AppLink";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { RecargaSpeiInstructions } from "@/interfaces/ITransaction";
import { formatDateTime, money } from "../persons/estado-cuenta/components/format";
import { useRecargarSaldo } from "./useRecargarSaldo";

const QUICK_AMOUNTS = [100, 200, 500, 1000];
const MAX_AMOUNT = 100000;

function CopyField({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (insecure context / permissions) -- the value is still visible to copy by hand.
    }
  };
  return (
    <div className="flex items-center justify-between gap-3 rounded-box bg-base-200 px-4 py-3">
      <div className="min-w-0">
        <p className="text-xs text-base-content/60">{label}</p>
        <p className={`break-all text-lg font-bold ${mono ? "font-mono tracking-wider" : ""}`}>{value}</p>
      </div>
      <button type="button" onClick={copy} className="btn btn-ghost btn-sm shrink-0" aria-label={`Copiar ${label}`}>
        <span className={`iconify size-4 ${copied ? "lucide--check text-success" : "lucide--copy"}`}></span>
        {copied ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}

function InstructionsCard({ data, onClose }: { data: RecargaSpeiInstructions; onClose: () => void }) {
  return (
    <div className="card border border-base-300 bg-base-100 shadow-sm">
      <div className="card-body gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="card-title">Instrucción de transferencia SPEI</h2>
            <p className="text-sm text-base-content/60">Generada el {formatDateTime(data.created)}</p>
          </div>
          <span className="badge badge-warning">Pendiente de confirmar</span>
        </div>

        <div>
          <p className="text-sm text-base-content/60">Monto a transferir</p>
          <p className="text-3xl font-bold">{money(data.amount)}</p>
        </div>

        <p className="text-sm text-base-content/80">{data.message}</p>

        {data.clabe && (
          <div className="flex flex-col gap-2">
            <CopyField label="CLABE interbancaria" value={data.clabe} />
            {data.bank && <CopyField label="Banco" value={data.bank} mono={false} />}
            {data.owner_name && <CopyField label="Beneficiario" value={data.owner_name} mono={false} />}
            {data.reference && <CopyField label="Concepto / referencia" value={data.reference} />}
          </div>
        )}

        <div className="alert alert-info text-sm">
          <span className="iconify lucide--info size-5"></span>
          <div>
            Transfiere exactamente {money(data.amount)}
            {data.reference ? <> y escribe <b>{data.reference}</b> en el concepto</> : null}. Tu saldo se
            acreditará cuando la escuela confirme que recibió el depósito.
          </div>
        </div>

        <div className="card-actions justify-end">
          <button type="button" onClick={onClose} className="btn btn-primary">
            Listo
          </button>
        </div>
      </div>
    </div>
  );
}

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
        <InstructionsCard data={instructions} onClose={() => { closeInstructions(); setAmount(""); }} />
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
