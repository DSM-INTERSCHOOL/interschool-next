"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PrintButton, PrintSection } from "@/components/PrintSection";
import { CommercePersonRead } from "@/interfaces/ICommercePerson";
import { usePersonSearch } from "../../prepago/hooks";
import { GeneralTab, RecargasTab, money } from "./components";
import { useEstadoCuenta } from "./useEstadoCuenta";

type Tab = "general" | "recargas";

const TABS: { value: Tab; label: string; printTitle: string }[] = [
  { value: "general", label: "General", printTitle: "Estado de cuenta general" },
  { value: "recargas", label: "Recargas", printTitle: "Estado de cuenta de recargas" },
];

const personName = (p: CommercePersonRead) =>
  [p.given_name, p.paternal_name, p.maternal_name].filter(Boolean).join(" ") || p.person_internal_id;

export default function EstadoCuentaPage() {
  const searchParams = useSearchParams();
  const search = usePersonSearch();
  const estado = useEstadoCuenta();
  const [person, setPerson] = useState<{ id: string; name: string } | null>(null);
  const [tab, setTab] = useState<Tab>(searchParams.get("tab") === "recargas" ? "recargas" : "general");

  // Deep-linked from the Clientes list (?person_id=...): load straight away.
  useEffect(() => {
    const personId = searchParams.get("person_id");
    if (!personId) return;
    setPerson({ id: personId, name: personId });
    estado.load(personId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // The statement carries the real name -- replaces the bare id shown
  // while a deep-linked load is in flight.
  useEffect(() => {
    if (estado.general) setPerson({ id: estado.general.person_internal_id, name: estado.general.name });
  }, [estado.general]);

  const selectPerson = (p: CommercePersonRead) => {
    setPerson({ id: p.person_internal_id, name: personName(p) });
    search.setQuery("");
    estado.load(p.person_internal_id);
  };

  const changePerson = () => {
    setPerson(null);
    estado.clear();
  };

  const loaded = tab === "general" ? estado.general : estado.wallet;
  const activeTab = TABS.find((t) => t.value === tab)!;
  const periodLabel = `${estado.start || "inicio"} al ${estado.end || "hoy"}`;

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body">
        <p className="text-base-content/60 text-sm mb-4">
          <strong>General:</strong> todo el dinero que ha entrado o salido por el cliente (pagos de órdenes,
          recargas, devoluciones). <strong>Recargas:</strong> los movimientos de su saldo prepago, con el saldo
          después de cada uno.
        </p>

        {!person ? (
          <div className="form-control max-w-xl">
            <label className="label py-1">
              <span className="label-text text-xs">Cliente</span>
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
                {search.results.map((p) => (
                  <li key={p.person_internal_id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg border border-base-300 p-3 text-left hover:bg-base-200"
                      onClick={() => selectPerson(p)}
                    >
                      <div>
                        <p className="font-medium">{personName(p)}</p>
                        <p className="text-xs text-base-content/60">{p.person_internal_id}</p>
                      </div>
                      <span className="text-sm text-base-content/60">Saldo: {money(p.balance)}</span>
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
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-base-300 p-4">
              <div>
                <p className="text-xl font-bold">{person.name}</p>
                <p className="text-sm text-base-content/60">{person.id}</p>
                <button type="button" className="btn btn-ghost btn-xs mt-2" onClick={changePerson}>
                  <span className="iconify lucide--arrow-left size-3"></span>
                  Cambiar cliente
                </button>
              </div>
              {estado.wallet && (
                <div className="text-right">
                  <p className="text-sm text-base-content/60">Saldo actual</p>
                  <p className="text-2xl font-bold tabular-nums">{money(estado.wallet.current_balance)}</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-end gap-3 mb-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Desde</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered input-sm w-full"
                  value={estado.start}
                  onChange={(e) => estado.setStart(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Hasta</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered input-sm w-full"
                  value={estado.end}
                  onChange={(e) => estado.setEnd(e.target.value)}
                />
              </div>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => estado.load(person.id)}>
                <span className="iconify lucide--search size-4"></span>
                Buscar
              </button>
              <PrintButton title={activeTab.printTitle} disabled={!loaded} landscape />
            </div>

            <div role="tablist" className="tabs tabs-border mb-4">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  role="tab"
                  className={`tab ${tab === t.value ? "tab-active" : ""}`}
                  onClick={() => setTab(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {estado.error && (
              <div className="alert alert-error mb-4">
                <span className="iconify lucide--alert-circle size-6"></span>
                <div>{estado.error}</div>
              </div>
            )}

            {estado.loading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner message="Cargando estado de cuenta..." />
              </div>
            ) : tab === "general" && estado.general ? (
              <GeneralTab statement={estado.general} />
            ) : tab === "recargas" && estado.wallet ? (
              <RecargasTab statement={estado.wallet} />
            ) : null}
          </>
        )}
      </div>

      {loaded && (
        <PrintSection
          title={activeTab.printTitle}
          landscape
          meta={[
            { label: "Cliente", value: `${loaded.person_internal_id} - ${loaded.name}` },
            { label: "Periodo", value: periodLabel },
          ]}
        >
          {tab === "general" && estado.general ? (
            <GeneralTab statement={estado.general} print />
          ) : estado.wallet ? (
            <RecargasTab statement={estado.wallet} print />
          ) : null}
        </PrintSection>
      )}
    </div>
  );
}
