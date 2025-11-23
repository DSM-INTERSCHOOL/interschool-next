import { IAttachmentRead } from "@/interfaces/IAnnouncement";

interface AttachmentsManagerProps {
    attachments: File[];
    existingAttachments: IAttachmentRead[];
    onAdd: (file: File) => void;
    onRemove: (index: number) => void;
    onRemoveExisting: (index: number) => void;
    publicationType: 'announcement' | 'assignment';
}

export const AttachmentsManager = ({
    attachments,
    existingAttachments,
    onAdd,
    onRemove,
    onRemoveExisting,
    publicationType
}: AttachmentsManagerProps) => {
    const handleFileSelect = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = '*/*';
        input.onchange = (e: any) => {
            const files = Array.from(e.target.files) as File[];
            files.forEach((file) => onAdd(file));
        };
        input.click();
    };

    return (
        <fieldset className="fieldset w-full">
            <legend className="fieldset-legend flex items-center gap-2">
                <span className="iconify lucide--paperclip size-4"></span>
                Archivos Adjuntos
            </legend>
            <div className="space-y-4">
                {/* Drop zone */}
                <div
                    className="border-2 border-dashed border-base-300 rounded-lg p-6 text-center hover:border-base-400 transition-colors cursor-pointer"
                    onDrop={(e) => {
                        e.preventDefault();
                        const files = Array.from(e.dataTransfer.files);
                        files.forEach(file => onAdd(file));
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={handleFileSelect}
                >
                    <span className="iconify lucide--upload size-8 text-base-content/40 mb-2"></span>
                    <p className="text-base-content/70 mb-1">
                        Arrastra archivos aquí o haz clic para seleccionar
                    </p>
                    <p className="text-sm text-base-content/50">
                        Puedes agregar documentos, imágenes, PDFs, etc.
                    </p>
                </div>

                {/* Lista de archivos existentes (en modo edición) */}
                {existingAttachments.length > 0 && (
                    <div className="space-y-2">
                        <h5 className="font-medium text-base-content">
                            Archivos adjuntos actuales ({existingAttachments.length})
                        </h5>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {existingAttachments.map((attachment, index) => (
                                <div
                                    key={attachment.id}
                                    className="flex items-center justify-between p-3 bg-base-100 rounded-lg border border-base-300"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <span className="iconify lucide--file size-4 text-base-content/60"></span>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-base-content">
                                                {attachment.file_name}
                                            </p>
                                            <p className="text-xs text-base-content/60">
                                                {attachment.file_size ? (attachment.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'Tamaño desconocido'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <a
                                            href={attachment.public_url || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-ghost btn-sm btn-circle"
                                            title="Descargar/Ver archivo"
                                        >
                                            <span className="iconify lucide--download size-4"></span>
                                        </a>
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-sm btn-circle"
                                            onClick={() => onRemoveExisting(index)}
                                            title="Eliminar archivo"
                                        >
                                            <span className="iconify lucide--x size-4"></span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Lista de archivos adjuntos nuevos */}
                {attachments.length > 0 && (
                    <div className="space-y-2">
                        <h5 className="font-medium text-base-content">
                            Archivos nuevos para agregar ({attachments.length})
                        </h5>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {attachments.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-base-100 rounded-lg border border-base-300"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="iconify lucide--file size-4 text-base-content/60"></span>
                                        <div>
                                            <p className="text-sm font-medium text-base-content">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-base-content/60">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-ghost btn-sm btn-circle"
                                        onClick={() => onRemove(index)}
                                    >
                                        <span className="iconify lucide--x size-4"></span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <p className="fieldset-label">Los archivos se adjuntarán a {publicationType === 'assignment' ? 'la tarea' : 'al aviso'}</p>
        </fieldset>
    );
};
