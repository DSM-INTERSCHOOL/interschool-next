"use client";

import { useRef, useEffect } from "react";
import { AppLink as Link } from "@/components/AppLink";
import { PageTitle } from "@/components/PageTitle";
import { CommercePersonRead } from "@/interfaces/ICommercePerson";
import { TOPUP_TENDER_METHODS } from "@/interfaces/ITransaction";
import { SpeiInstructionsCard } from "../components/SpeiInstructionsCard";
import { usePersonSearch, usePrepago } from "./hooks";

const fullName = (person: CommercePersonRead) =>
  [person.given_name, person.paternal_name, person.maternal_name].filter(Boolean).join(" ") ||
  person.person_internal_id;

export default function PrepagoPage() {
  const search = usePersonSearch();
  const prepago = usePrepago(() => {
    // Nothing extra to refresh here today -- kept as a hook so a future
    // "recent top-ups" panel can reload without changing the hook's shape.
  });
  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (prepago.addMethod) amountInputRef.current?.focus();
  }, [prepago.addMethod]);

  const handleSelectPerson = (person: CommercePersonRead) => {
    prepago.selectPerson(person);
    search.setQuery("");
  };

  return (
    <>
      <PageTitle title="Prepago" />

      <div className="mt-6 flex flex-col gap-6">
        <div className="flex justify-end">
          <Link href="/apps/commerce/recargas-pendientes" className="btn btn-outline btn-sm">
            <span className="iconify lucide--clock-9 size-4"></span>
            Recargas pendientes
          </Link>
        </div>

        {prepago.successMessage && (
          <div className="alert alert-success shadow-lg">
            <span className="iconify lucide--check-circle size-5"></span>
            <span>{prepago.successMessage}</span>
          </div>
        )}

        {prepago.speiInstructions.map((data) => (
          <SpeiInstructionsCard
            key={data.order_payment_id}
            data={data}
            customerName={prepago.selectedPerson ? fullName(prepago.selectedPerson) : undefined}
            onClose={prepago.closeSpeiInstructions}
          />
        ))}

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body gap-5!">
            {!prepago.selectedPerson ? (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Cliente</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Nombre, correo o ID del cliente"
                    className="input input-bordered w-full"
                    value={search.query}
                    onChange={(e) => search.setQuery(e.target.value)}
                  />
                  {search.loading && (
                    <span className="loading loading-spinner loading-sm absolute right-4 top-1/2 -translate-y-1/2"></span>
                  )}
                </div>
                {search.error && <p className="mt-1 text-sm text-error">{search.error}</p>}

                {search.results.length > 0 && (
                  <ul className="mt-2 flex flex-col gap-2">
                    {search.results.map((person) => (
                      <li key={person.person_internal_id}>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between rounded-lg border border-base-300 p-3 text-left hover:bg-base-200"
                          onClick={() => handleSelectPerson(person)}
                        >
                          <div>
                            <p className="font-medium">{fullName(person)}</p>
                            <p className="text-xs text-base-content/60">{person.person_internal_id}</p>
                          </div>
                          <span className="text-sm text-base-content/60">
                            Saldo: ${Number(person.balance).toFixed(2)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {search.query.trim().length >= 2 && !search.loading && search.results.length === 0 && (
                  <p className="mt-2 text-center text-sm text-base-content/50">Sin resultados</p>
                )}
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-base-300 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold">{fullName(prepago.selectedPerson)}</p>
                      <p className="text-sm text-base-content/60">{prepago.selectedPerson.person_internal_id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-base-content/60">Saldo actual</p>
                      <p className="w-28 text-right text-2xl font-bold tabular-nums">
                        ${Number(prepago.selectedPerson.balance).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <button type="button" className="btn btn-ghost btn-xs mt-2" onClick={prepago.reset}>
                    <span className="iconify lucide--arrow-left size-3"></span>
                    Cambiar cliente
                  </button>
                </div>

                <div className="rounded-xl border border-base-300 p-4">
                  <p className="mb-2 font-semibold">Agregar forma de pago</p>
                  <div className="flex flex-wrap gap-2">
                    {prepago.visibleTopupTenderMethods.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        className={`btn btn-sm ${prepago.addMethod === m.value ? "btn-primary" : "btn-outline"}`}
                        onClick={() => prepago.pickAddMethod(m.value)}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                  {prepago.addMethod === "SPEI" && (
                    <p className="mt-2 text-sm text-warning">
                      Quedará pendiente de confirmar hasta verificar que la transferencia llegó. Al registrar
                      la recarga se genera la ficha con la CLABE y la referencia para el cliente.
                    </p>
                  )}
                  {prepago.addMethod && (
                    <div className="mt-3 flex flex-wrap items-end gap-2">
                      <div className="form-control">
                        <label className="label py-1">
                          <span className="label-text text-xs">Monto</span>
                        </label>
                        <input
                          ref={amountInputRef}
                          type="text"
                          inputMode="decimal"
                          className="input input-bordered input-sm w-40"
                          value={prepago.addAmount}
                          onChange={(e) => prepago.setAddAmount(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && prepago.addTender()}
                        />
                      </div>
                      <button type="button" className="btn btn-primary btn-sm" onClick={prepago.addTender}>
                        Agregar
                      </button>
                    </div>
                  )}
                  {prepago.addError && <p className="mt-1 text-sm text-error">{prepago.addError}</p>}
                </div>

                {prepago.tenders.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="table table-sm w-full">
                      <thead>
                        <tr>
                          <th>Forma de pago</th>
                          <th className="text-right">Monto</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {prepago.tenders.map((t) => (
                          <tr key={t.id}>
                            <td>
                              {TOPUP_TENDER_METHODS.find((m) => m.value === t.method)?.label ?? t.method}
                              {t.method === "SPEI" && (
                                <span className="badge badge-warning badge-xs ml-2">Pendiente</span>
                              )}
                            </td>
                            <td className="text-right">${t.amount.toFixed(2)}</td>
                            <td className="text-right">
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs text-error"
                                onClick={() => prepago.removeTender(t.id)}
                              >
                                <span className="iconify lucide--trash-2 size-4"></span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {prepago.total > 0 && (
                  <div className="flex flex-col gap-1 rounded-lg bg-base-200 px-4 py-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-base-content/70">Total a recargar</span>
                      <span className="text-lg font-bold">${prepago.total.toFixed(2)}</span>
                    </div>
                    {prepago.pendingTotal > 0 && (
                      <div className="flex items-center justify-between text-warning">
                        <span>De los cuales, pendientes de confirmar (SPEI)</span>
                        <span className="font-medium">${prepago.pendingTotal.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                {prepago.confirmError && (
                  <div className="alert alert-error">
                    <span className="iconify lucide--alert-circle size-5"></span>
                    <span>{prepago.confirmError}</span>
                  </div>
                )}

                <div className="card-actions justify-end">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!prepago.canConfirm}
                    onClick={prepago.confirmTopup}
                  >
                    {prepago.confirmLoading && <span className="loading loading-spinner loading-sm"></span>}
                    Registrar recarga
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
