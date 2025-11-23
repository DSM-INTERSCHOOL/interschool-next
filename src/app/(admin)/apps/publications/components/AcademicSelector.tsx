import { LoadingSpinner } from "@/components/LoadingSpinner";

interface AcademicItem {
    id: number;
    [key: string]: any;
}

interface AcademicSelectorProps<T extends AcademicItem> {
    title: string;
    icon: string;
    items: T[];
    selected: Set<number>;
    onToggle: (id: number, isSelected: boolean) => void;
    onSelectAll: (isSelected: boolean) => void;
    loading?: boolean;
    error?: string | null;
    renderLabel: (item: T) => string;
    emptyMessage?: string;
}

export function AcademicSelector<T extends AcademicItem>({
    title,
    icon,
    items,
    selected,
    onToggle,
    onSelectAll,
    loading = false,
    error = null,
    renderLabel,
    emptyMessage = "No se encontraron elementos"
}: AcademicSelectorProps<T>) {
    return (
        <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="card-title text-lg">
                        <span className={`iconify ${icon} size-5`}></span>
                        {title}
                    </h3>
                    <div className="text-sm text-base-content/70">
                        {selected.size} de {items.length} seleccionados
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <LoadingSpinner message={`Cargando ${title.toLowerCase()}...`} />
                    </div>
                ) : error ? (
                    <div className="alert alert-error shadow-lg">
                        <span className="iconify lucide--alert-circle size-6"></span>
                        <div>
                            <h3 className="font-bold">Error</h3>
                            <div className="text-sm">{error}</div>
                        </div>
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-8">
                        <span className={`iconify ${icon} size-16 text-base-content/30 mb-4`}></span>
                        <p className="text-base-content/70">{emptyMessage}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Checkbox para seleccionar todos */}
                        <div className="flex items-center gap-3 p-3 border border-base-300 rounded-lg bg-base-200">
                            <label className="label cursor-pointer flex items-center gap-3 p-0">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary"
                                    checked={items.length > 0 && selected.size === items.length}
                                    onChange={(e) => onSelectAll(e.target.checked)}
                                />
                                <span className="font-medium text-base-content">
                                    Seleccionar todos
                                </span>
                            </label>
                        </div>

                        {/* Lista de elementos */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className={`card border transition-all duration-200 ${
                                        selected.has(item.id)
                                            ? 'border-primary bg-primary/5'
                                            : 'border-base-300 hover:border-base-400'
                                    }`}
                                >
                                    <div className="card-body p-2">
                                        <label className="label cursor-pointer p-0 justify-start">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-primary checkbox-sm mr-2"
                                                checked={selected.has(item.id)}
                                                onChange={(e) => onToggle(item.id, e.target.checked)}
                                            />
                                            <div className="flex-1">
                                                <div className="text-xs text-base-content">
                                                    {renderLabel(item)}
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
