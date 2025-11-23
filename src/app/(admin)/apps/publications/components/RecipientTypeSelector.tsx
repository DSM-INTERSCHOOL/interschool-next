interface RecipientTypeSelectorProps {
    selected: Set<string>;
    onToggle: (type: string, isSelected: boolean) => void;
    onSelectAll: (isSelected: boolean) => void;
}

const RECIPIENT_TYPES = [
    { value: 'STUDENT', label: 'Estudiantes', icon: 'lucide--graduation-cap', color: 'primary' },
    { value: 'RELATIVE', label: 'Familiares', icon: 'lucide--heart', color: 'success' },
    { value: 'TEACHER', label: 'Profesores', icon: 'lucide--user-check', color: 'secondary' },
    { value: 'USER', label: 'Usuarios', icon: 'lucide--users', color: 'accent' }
] as const;

export const RecipientTypeSelector = ({ selected, onToggle, onSelectAll }: RecipientTypeSelectorProps) => {
    return (
        <div className="card card-border bg-base-100 shadow-lg">
            <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="card-title text-lg">
                        <span className="iconify lucide--users-2 size-5"></span>
                        Selecciona Tipo Destinatarios
                    </h3>
                    <div className="text-sm text-base-content/70">
                        {selected.size} de {RECIPIENT_TYPES.length} seleccionados
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Checkbox para seleccionar todos */}
                    <div className="flex items-center gap-3 p-3 border border-base-300 rounded-lg bg-base-200">
                        <label className="label cursor-pointer flex items-center gap-3 p-0">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-primary"
                                checked={selected.size === RECIPIENT_TYPES.length}
                                onChange={(e) => onSelectAll(e.target.checked)}
                            />
                            <span className="font-medium text-base-content">
                                Seleccionar todos los tipos de destinatarios
                            </span>
                        </label>
                    </div>

                    {/* Lista de tipos de destinatarios */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {RECIPIENT_TYPES.map((recipientType) => (
                            <div
                                key={recipientType.value}
                                className={`card border transition-all duration-200 ${
                                    selected.has(recipientType.value)
                                        ? `border-${recipientType.color} bg-${recipientType.color}/5`
                                        : 'border-base-300 hover:border-base-400'
                                }`}
                            >
                                <div className="card-body p-3">
                                    <div className="form-control">
                                        <label className="label cursor-pointer p-0 justify-start">
                                            <input
                                                type="checkbox"
                                                className={`checkbox checkbox-${recipientType.color} checkbox-sm mr-3`}
                                                checked={selected.has(recipientType.value)}
                                                onChange={(e) => onToggle(recipientType.value, e.target.checked)}
                                            />
                                            <div className="flex items-center gap-2">
                                                <span className={`iconify ${recipientType.icon} size-4 text-${recipientType.color}`}></span>
                                                <div className="text-sm text-base-content">
                                                    {recipientType.label}
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
