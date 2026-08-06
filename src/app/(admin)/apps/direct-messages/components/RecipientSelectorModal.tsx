"use client";

import { useEffect } from "react";
import { RecipientCandidate } from "@/services/directMessage.service";
import { useRecipientSearch, PAGE_LIMIT } from "../hooks/useRecipientSearch";
import { PERSON_TYPE_LABEL, TYPE_COLOR, initials } from "../utils/directMessage.utils";

const TYPE_CARD_CONFIG: Record<string, { label: string; icon: string; activeCard: string }> = {
  USER:     { label: "Usuario",   icon: "lucide--user",           activeCard: "border-accent    bg-accent/10    text-accent" },
  STUDENT:  { label: "Alumno",    icon: "lucide--graduation-cap", activeCard: "border-primary   bg-primary/10   text-primary" },
  TEACHER:  { label: "Profesor",  icon: "lucide--user-check",     activeCard: "border-secondary bg-secondary/10 text-secondary" },
  RELATIVE: { label: "Familiar",  icon: "lucide--users-round",    activeCard: "border-success   bg-success/10   text-success" },
  ACADEMIC: { label: "Académico", icon: "lucide--book-open",      activeCard: "border-warning   bg-warning/10   text-warning" },
};

interface Props {
  onSelect: (candidate: RecipientCandidate) => void;
  onClose: () => void;
}

export const RecipientSelectorModal = ({ onSelect, onClose }: Props) => {
  const {
    allowedTypes, activeType, searchTerm, results, total, skip, setSkip,
    searching, hasSearched, error,
    hasPrev, hasNext, totalPages, currentPage,
    handleSearchChange, handleTypeChange, reset,
  } = useRecipientSearch();

  useEffect(() => {
    reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (c: RecipientCandidate) => { onSelect(c); onClose(); };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md flex flex-col" style={{ maxHeight: "80vh" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="font-bold text-lg">Seleccionar destinatario</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <span className="iconify lucide--x size-5" />
          </button>
        </div>

        {/* Type filter cards — same style as citas/reuniones */}
        <div className="flex gap-2 mb-3 shrink-0">
          <button
            onClick={() => handleTypeChange("Todos")}
            className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg border-2 transition-all cursor-pointer min-w-0 ${
              activeType === "Todos"
                ? "border-base-content/50 bg-base-content/8 text-base-content"
                : "border-base-200 text-base-content/40 hover:border-base-300 hover:text-base-content/60"
            }`}
          >
            <span className="iconify lucide--search size-4" />
            <span className="text-[11px] font-semibold">Todos</span>
          </button>

          {allowedTypes.map((type) => {
            const cfg = TYPE_CARD_CONFIG[type];
            const isActive = activeType === type;
            return (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg border-2 transition-all cursor-pointer min-w-0 ${
                  isActive
                    ? cfg?.activeCard ?? "border-primary bg-primary/10 text-primary"
                    : "border-base-200 text-base-content/40 hover:border-base-300 hover:text-base-content/60"
                }`}
              >
                <span className={`iconify ${cfg?.icon ?? "lucide--user"} size-4`} />
                <span className="text-[11px] font-semibold truncate w-full text-center">{cfg?.label ?? PERSON_TYPE_LABEL[type] ?? type}</span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative mb-3 shrink-0">
          <span className="iconify lucide--search size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/35 pointer-events-none" />
          <input
            type="text"
            className="input input-bordered input-sm w-full pl-9"
            placeholder="Buscar por nombre o ID…"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            autoFocus
          />
        </div>

        {/* Results — fixed size with vertical scroll (shrinks if space is tight) */}
        <div className="overflow-y-auto min-h-0" style={{ height: "320px" }}>
          {searching && (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-md text-primary" />
            </div>
          )}

          {!searching && error && (
            <div className="alert alert-error">
              <span className="iconify lucide--alert-circle size-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {!searching && !error && !hasSearched && (
            <div className="text-center py-10 text-sm text-base-content/40">
              Selecciona un tipo o escribe para buscar
            </div>
          )}

          {!searching && !error && hasSearched && results.length === 0 && (
            <div className="text-center py-10">
              <span className="iconify lucide--user-x size-10 text-base-content/20 block mx-auto mb-2" />
              <p className="text-sm text-base-content/40">Sin resultados</p>
            </div>
          )}

          {!searching && !error && results.length > 0 && (
            <>
              <div className="space-y-1 pr-0.5">
                {results.map((c) => {
                  const color = TYPE_COLOR[c.person_type] ?? "#37474F";
                  const name = c.full_name || [c.given_name, c.paternal_name].filter(Boolean).join(" ");
                  return (
                    <button
                      key={c.person_id}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-base-200 transition-colors text-left"
                      onClick={() => handleSelect(c)}
                    >
                      {/* Avatar */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                        style={{ backgroundColor: color }}
                      >
                        {initials(name)}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{name}</p>
                        <p className="text-xs text-base-content/50 truncate">
                          {PERSON_TYPE_LABEL[c.person_type] ?? c.person_type}
                          {c.job_position ? ` · ${c.job_position}` : ""}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-base-200 sticky bottom-0 bg-base-100">
                <span className="text-xs text-base-content/40">
                  {skip + 1}–{Math.min(skip + PAGE_LIMIT, total)} de {total}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    className="btn btn-ghost btn-xs btn-circle"
                    onClick={() => setSkip(skip - PAGE_LIMIT)}
                    disabled={!hasPrev}
                  >
                    <span className="iconify lucide--chevron-left size-4" />
                  </button>
                  <span className="text-xs font-medium px-1">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    className="btn btn-ghost btn-xs btn-circle"
                    onClick={() => setSkip(skip + PAGE_LIMIT)}
                    disabled={!hasNext}
                  >
                    <span className="iconify lucide--chevron-right size-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
};
