"use client";

type RecipientMode = "todos" | "especificos";

interface Props {
  mode: RecipientMode;
  onChange: (mode: RecipientMode) => void;
  totalCount: number | null;   // "todos" mode: pre-loaded recipient count
  loading: boolean;            // "todos" mode: loading indicator
  selectedCount?: number;      // "especificos" mode: manually selected count
  disabled?: boolean;
}

export const RecipientModeSelector = ({ mode, onChange, totalCount, loading, selectedCount = 0, disabled }: Props) => (
  <div className="form-control">
    <label className="label pb-1.5">
      <span className="label-text font-medium">Destinatarios</span>
    </label>

    <div className="grid grid-cols-2 gap-2">
      {(["todos", "especificos"] as RecipientMode[]).map((opt) => {
        const active = mode === opt;
        return (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${
              active
                ? "border-primary bg-primary/8 text-primary"
                : "border-base-200 text-base-content/50 hover:border-base-300 hover:text-base-content/70"
            }`}
            onClick={() => onChange(opt)}
          >
            <span className={`iconify size-5 shrink-0 ${opt === "todos" ? "lucide--users" : "lucide--user-check"}`} />
            <span className="text-sm font-semibold">
              {opt === "todos" ? "Todos" : "Selección específica"}
            </span>
          </button>
        );
      })}
    </div>

    {/* Count / status indicator */}
    <div className="mt-2 flex items-center gap-2 pl-1 min-h-[1.25rem]">
      {mode === "todos" && (
        loading ? (
          <>
            <span className="loading loading-spinner loading-xs text-primary" />
            <span className="text-xs text-base-content/50">Cargando destinatarios…</span>
          </>
        ) : (
          <span className="text-xs text-base-content/50">
            <span className="iconify lucide--users size-3.5 inline mr-1" />
            {totalCount !== null
              ? `${totalCount} destinatario${totalCount !== 1 ? "s" : ""}`
              : "—"
            }
          </span>
        )
      )}
      {mode === "especificos" && selectedCount > 0 && (
        <span className="text-xs text-success font-medium">
          <span className="iconify lucide--check-circle size-3.5 inline mr-1" />
          {selectedCount} seleccionado{selectedCount !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  </div>
);
