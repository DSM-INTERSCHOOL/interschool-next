"use client";

import { IAvailabilityRuleRead } from "@/interfaces/IAppointment";

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

interface Props {
  rules: IAvailabilityRuleRead[];
  onAdd: () => void;
  onEdit: (rule: IAvailabilityRuleRead) => void;
  onDelete: (ruleId: string) => void;
}

export const RulesPanel = ({ rules, onAdd, onEdit, onDelete }: Props) => (
  <div className="card bg-base-100 border border-base-300">
    <div className="card-body">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="iconify lucide--clock size-5 text-primary" />
          <h3 className="font-bold text-lg">Reglas semanales</h3>
          <span className="badge badge-primary badge-sm">{rules.length}</span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={onAdd}>
          <span className="iconify lucide--plus size-4" />
          Agregar regla
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="text-center py-8">
          <span className="iconify lucide--clock size-12 text-base-content/20 mb-2" />
          <p className="text-base-content/50 text-sm">
            Sin reglas. Agrega ventanas de tiempo en las que esta persona está disponible.
          </p>
        </div>
      ) : (
        <div className="space-y-2 mt-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between p-3 rounded-lg bg-base-200 gap-3"
            >
              <div className="flex-1 min-w-0">
                {/* Days */}
                <div className="flex flex-wrap gap-1 mb-1">
                  {DAY_LABELS.map((label, i) => (
                    <span
                      key={i}
                      className={`badge badge-xs ${rule.days_of_week.includes(i) ? "badge-primary" : "badge-ghost opacity-30"}`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                {/* Time */}
                <p className="text-sm font-medium">
                  <span className="iconify lucide--clock size-3.5 inline mr-1 text-base-content/50" />
                  {rule.start_time.slice(0, 5)} – {rule.end_time.slice(0, 5)}
                </p>
                {/* Date range */}
                {(rule.valid_from || rule.valid_until) && (
                  <p className="text-xs text-base-content/50 mt-0.5">
                    {rule.valid_from ?? "—"} → {rule.valid_until ?? "—"}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!rule.active && (
                  <span className="badge badge-ghost badge-xs">Inactiva</span>
                )}
                <button
                  className="btn btn-ghost btn-xs"
                  title="Editar"
                  onClick={() => onEdit(rule)}
                >
                  <span className="iconify lucide--pencil size-4" />
                </button>
                <button
                  className="btn btn-ghost btn-xs text-error"
                  title="Eliminar"
                  onClick={() => onDelete(rule.id)}
                >
                  <span className="iconify lucide--trash-2 size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
