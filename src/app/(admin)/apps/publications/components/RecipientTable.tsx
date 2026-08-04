import { LoadingSpinner } from "@/components/LoadingSpinner";
import { IRecipient } from "@/interfaces/IRecipient";

interface RecipientTableProps {
    recipients: IRecipient[];
    selected: Set<number>;
    loading: boolean;
    error: string | null;
    onToggle: (personId: number, isSelected: boolean) => void;
    onSelectAll: (isSelected: boolean) => void;
    onLoadRecipients: () => void;
    selectedRecipientTypes: Set<string>;
}

export const RecipientTable = ({
    recipients,
    selected,
    loading,
    error,
    onToggle,
    onSelectAll,
    onLoadRecipients,
    selectedRecipientTypes
}: RecipientTableProps) => {
    const getPersonTypeBadge = (personType: string) => {
        const badges = {
            STUDENT: { class: 'badge-primary', label: 'Estudiante' },
            TEACHER: { class: 'badge-secondary', label: 'Profesor' },
            USER: { class: 'badge-accent', label: 'Usuario' },
            RELATIVE: { class: 'badge-success', label: 'Familiar' }
        };
        return badges[personType as keyof typeof badges] || { class: 'badge-ghost', label: personType };
    };

    return (
        <div className="card card-border bg-base-100 shadow-lg">
            <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="card-title text-lg">
                        <span className="iconify lucide--users size-5"></span>
                        Destinatarios
                    </h3>
                    <div className="flex items-center gap-3">
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={onLoadRecipients}
                            disabled={loading || selectedRecipientTypes.size === 0}
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-xs"></span>
                                    Cargando...
                                </>
                            ) : (
                                <>
                                    <span className="iconify lucide--search size-4"></span>
                                    Buscar Destinatarios
                                </>
                            )}
                        </button>
                        <div className="text-sm text-base-content/70">
                            {selected.size} de {recipients.length} seleccionados
                        </div>
                    </div>
                </div>

                {/* Mensaje de error */}
                {error && (
                    <div className="alert alert-error shadow-lg mt-4">
                        <span className="iconify lucide--alert-circle size-6"></span>
                        <div>
                            <h3 className="font-bold">Error de validación</h3>
                            <div className="text-sm">{error}</div>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-8">
                        <LoadingSpinner message="Cargando destinatarios..." />
                    </div>
                ) : recipients.length === 0 ? (
                    <div className="text-center py-8">
                        <span className="iconify lucide--users size-16 text-base-content/30 mb-4"></span>
                        <p className="text-base-content/70">
                            {selectedRecipientTypes.size > 0
                                ? "Haz clic en 'Buscar Destinatarios' para cargar la lista con los filtros seleccionados"
                                : "Selecciona al menos un tipo de destinatario"
                            }
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Checkbox para seleccionar todos */}
                        <div className="flex items-center gap-3 p-3 border border-base-300 rounded-lg bg-base-200">
                            <label className="label cursor-pointer flex items-center gap-3 p-0">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary"
                                    checked={recipients.length > 0 && selected.size === recipients.length}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                />
                                <span className="font-medium text-base-content">
                                    Seleccionar todos los destinatarios
                                </span>
                            </label>
                        </div>

                        {/* Tabla de destinatarios */}
                        <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
                            <table className="table table-zebra">
                                <thead className="sticky top-0 bg-base-100 z-10">
                                    <tr>
                                        <th>
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-primary"
                                                checked={recipients.length > 0 && selected.size === recipients.length}
                                                onChange={(e) => onSelectAll(e.target.checked)}
                                            />
                                        </th>
                                        <th>ID</th>
                                        <th>Nombre Completo</th>
                                        <th>Tipo</th>
                                        <th>Año Académico</th>
                                        <th>Nivel</th>
                                        <th>Programa</th>
                                        <th>Año Programa</th>
                                        <th>Grupo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recipients.map((recipient) => {
                                        const badge = getPersonTypeBadge(recipient.person_type);
                                        return (
                                            <tr
                                                key={recipient.person_id}
                                                className={`hover:bg-base-200 cursor-pointer ${
                                                    selected.has(recipient.person_id)
                                                        ? 'bg-primary/5 border-primary/20'
                                                        : ''
                                                }`}
                                                onClick={() => onToggle(
                                                    recipient.person_id,
                                                    !selected.has(recipient.person_id)
                                                )}
                                            >
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        className="checkbox checkbox-primary checkbox-sm"
                                                        checked={selected.has(recipient.person_id)}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            onToggle(recipient.person_id, e.target.checked);
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <div className="font-mono text-xs">
                                                        {recipient.person_internal_id}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="font-medium">
                                                        {recipient.full_name}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={`badge badge-sm ${badge.class}`}>
                                                        {badge.label}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="text-sm text-base-content/70">
                                                        {recipient.academic_year_key || '-'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="text-sm text-base-content/70">
                                                        {recipient.academic_stage_key || '-'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="text-sm text-base-content/70">
                                                        {recipient.academic_program_key || '-'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="text-sm text-base-content/70">
                                                        {recipient.program_year_key || '-'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="text-sm text-base-content/70">
                                                        {recipient.academic_group_key || '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Paginación si hay muchos resultados */}
                        {recipients.length > 50 && (
                            <div className="flex justify-center mt-4">
                                <div className="text-sm text-base-content/70">
                                    Mostrando {recipients.length} destinatarios
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
