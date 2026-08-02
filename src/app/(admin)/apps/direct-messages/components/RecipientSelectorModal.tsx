"use client";

import { useEffect } from "react";
import { RecipientCandidate } from "@/services/directMessage.service";
import { useRecipientSearch } from "../hooks/useRecipientSearch";
import { PERSON_TYPE_LABEL, TYPE_COLOR, initials } from "../utils/directMessage.utils";

interface Props {
  onSelect: (candidate: RecipientCandidate) => void;
  onClose: () => void;
}

export const RecipientSelectorModal = ({ onSelect, onClose }: Props) => {
  const {
    allowedTypes, activeType, searchTerm, results, searching, hasSearched,
    handleSearchChange, handleTypeChange, reset,
  } = useRecipientSearch();

  useEffect(() => { reset(); }, []);

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

        {/* Type filter pills */}
        <div className="flex flex-wrap gap-1.5 mb-3 shrink-0">
          {["Todos", ...allowedTypes].map((type) => (
            <button
              key={type}
              className={`btn btn-xs rounded-full ${activeType === type ? "btn-primary" : "btn-ghost bg-base-200"}`}
              onClick={() => handleTypeChange(type)}
            >
              {type === "Todos" ? "Todos" : (PERSON_TYPE_LABEL[type] ?? type)}
            </button>
          ))}
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

        {/* Results */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {searching && (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-md text-primary" />
            </div>
          )}

          {!searching && !hasSearched && (
            <div className="text-center py-10 text-sm text-base-content/40">
              Selecciona un tipo o escribe para buscar
            </div>
          )}

          {!searching && hasSearched && results.length === 0 && (
            <div className="text-center py-10">
              <span className="iconify lucide--user-x size-10 text-base-content/20 block mx-auto mb-2" />
              <p className="text-sm text-base-content/40">Sin resultados</p>
            </div>
          )}

          {!searching && results.map((c) => {
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
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
};
