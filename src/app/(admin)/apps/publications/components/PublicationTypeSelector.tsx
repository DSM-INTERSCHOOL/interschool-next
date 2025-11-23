interface PublicationTypeSelectorProps {
    value: 'announcement' | 'assignment';
    onChange: (type: 'announcement' | 'assignment') => void;
}

export const PublicationTypeSelector = ({ value, onChange }: PublicationTypeSelectorProps) => {
    return (
        <div className="card card-border bg-base-100 shadow-lg">
            <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="card-title text-lg">
                        <span className="iconify lucide--file-type size-5"></span>
                        Tipo de Publicación
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Opción Aviso */}
                    <div
                        className={`card border-2 cursor-pointer transition-all duration-200 ${
                            value === 'announcement'
                                ? 'border-primary bg-primary/10'
                                : 'border-base-300 hover:border-base-400'
                        }`}
                        onClick={() => onChange('announcement')}
                    >
                        <div className="card-body">
                            <div className="flex items-center gap-4">
                                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                                    value === 'announcement' ? 'bg-primary text-primary-content' : 'bg-base-200'
                                }`}>
                                    <span className="iconify lucide--megaphone size-6"></span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-base">Aviso</h4>
                                    <p className="text-sm text-base-content/70">
                                        Publicar información general para la comunidad educativa
                                    </p>
                                </div>
                                {value === 'announcement' && (
                                    <span className="iconify lucide--check-circle size-6 text-primary"></span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Opción Tarea */}
                    <div
                        className={`card border-2 cursor-pointer transition-all duration-200 ${
                            value === 'assignment'
                                ? 'border-secondary bg-secondary/10'
                                : 'border-base-300 hover:border-base-400'
                        }`}
                        onClick={() => onChange('assignment')}
                    >
                        <div className="card-body">
                            <div className="flex items-center gap-4">
                                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                                    value === 'assignment' ? 'bg-secondary text-secondary-content' : 'bg-base-200'
                                }`}>
                                    <span className="iconify lucide--clipboard-list size-6"></span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-base">Tarea</h4>
                                    <p className="text-sm text-base-content/70">
                                        Asignar tareas y actividades con fecha de entrega
                                    </p>
                                </div>
                                {value === 'assignment' && (
                                    <span className="iconify lucide--check-circle size-6 text-secondary"></span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
