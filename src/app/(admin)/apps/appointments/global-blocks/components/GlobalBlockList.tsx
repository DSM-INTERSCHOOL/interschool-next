"use client";

import { IGlobalBlockRead } from "@/interfaces/IAppointment";

interface GlobalBlockListProps {
  blocks: IGlobalBlockRead[];
  onEdit: (block: IGlobalBlockRead) => void;
  onDelete: (blockId: string) => void;
}

const BLOCK_TYPE_COLORS: Record<string, string> = {
  HOLIDAY: "badge-success",
  MAINTENANCE: "badge-warning",
  BREAK: "badge-info",
  OTHER: "badge-neutral",
};

const formatDate = (iso: string | null): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const GlobalBlockList = ({
  blocks,
  onEdit,
  onDelete,
}: GlobalBlockListProps) => {
  if (blocks.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="iconify lucide--calendar-off size-20 text-base-content/20 mb-4" />
        <h3 className="text-xl font-medium text-base-content mb-2">
          Sin bloqueos globales
        </h3>
        <p className="text-base-content/60">
          Crea un bloqueo para impedir reuniones durante un período específico
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead className="sticky top-0 z-10 bg-base-200">
          <tr>
            <th className="bg-base-200">Nombre</th>
            <th className="bg-base-200">Tipo</th>
            <th className="bg-base-200">Inicio</th>
            <th className="bg-base-200">Fin</th>
            <th className="bg-base-200 text-center">Aplica a todos</th>
            <th className="bg-base-200 text-center">Recurrente</th>
            <th className="bg-base-200 text-center">Estado</th>
            <th className="bg-base-200">Personas</th>
            <th className="bg-base-200">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((block) => (
            <tr key={block.id}>
              <td>
                <span className="font-medium">{block.name}</span>
              </td>
              <td>
                <span
                  className={`badge ${BLOCK_TYPE_COLORS[block.block_type] ?? "badge-neutral"} badge-sm`}
                >
                  {block.block_type}
                </span>
              </td>
              <td className="text-sm">{formatDate(block.start_date)}</td>
              <td className="text-sm">{formatDate(block.end_date)}</td>
              <td className="text-center">
                {block.applies_to_all ? (
                  <span className="badge badge-primary badge-sm">Todos</span>
                ) : (
                  <span className="badge badge-ghost badge-sm">Parcial</span>
                )}
              </td>
              <td className="text-center">
                {block.recurring ? (
                  <span className="iconify lucide--repeat size-4 text-info" title="Recurrente" />
                ) : (
                  <span className="text-base-content/30 text-sm">—</span>
                )}
              </td>
              <td className="text-center">
                {block.active ? (
                  <span className="badge badge-success badge-sm">Activo</span>
                ) : (
                  <span className="badge badge-ghost badge-sm">Inactivo</span>
                )}
              </td>
              <td>
                {block.applies_to_all ? (
                  <span className="text-xs text-base-content/50">Todos</span>
                ) : block.persons.length > 0 ? (
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {block.persons.slice(0, 3).map((p) => (
                      <span key={p.id} className="badge badge-outline badge-xs">
                        {p.given_name} {p.paternal_surname}
                      </span>
                    ))}
                    {block.persons.length > 3 && (
                      <span className="badge badge-ghost badge-xs">
                        +{block.persons.length - 3}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-base-content/40">—</span>
                )}
              </td>
              <td>
                <div className="flex gap-1">
                  <button
                    className="btn btn-ghost btn-xs"
                    title="Editar"
                    onClick={() => onEdit(block)}
                  >
                    <span className="iconify lucide--pencil size-4" />
                  </button>
                  <button
                    className="btn btn-ghost btn-xs text-error"
                    title="Eliminar"
                    onClick={() => onDelete(block.id)}
                  >
                    <span className="iconify lucide--trash-2 size-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
