"use client";

import { LoadingSpinner } from "@/components/LoadingSpinner";

export interface ChipOption {
  id: number;
  label: string;
}

interface ChipMultiSelectProps {
  label: string;
  options: ChipOption[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

// Toggleable badge list for short label sets (colors/sizes/categories) --
// no multi-select/chip component exists elsewhere in the app to reuse.
export function ChipMultiSelect({
  label,
  options,
  selectedIds,
  onChange,
  loading = false,
  error = null,
  emptyMessage = "No hay opciones disponibles.",
}: ChipMultiSelectProps) {
  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div>
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      {loading ? (
        <LoadingSpinner size="sm" message="" />
      ) : error ? (
        <div className="text-error text-sm">{error}</div>
      ) : options.length === 0 ? (
        <div className="text-base-content/60 text-sm">{emptyMessage}</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const selected = selectedIds.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggle(option.id)}
                className={`badge cursor-pointer ${selected ? "badge-primary" : "badge-outline"}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
