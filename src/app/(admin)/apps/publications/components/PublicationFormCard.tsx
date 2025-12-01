import { Editor } from "@tinymce/tinymce-react";
import { AttachmentsManager } from "./AttachmentsManager";
import { IAttachmentRead } from "@/interfaces/IAnnouncement";

interface FormData {
    title: string;
    content: string;
    startDate: string;
    endDate: string;
    acceptComments: boolean;
    authorized: boolean;
    subjectId: string;
    subjectName: string;
    dueDate: string;
}

interface PublicationFormCardProps {
    announcementId?: string;
    publicationType: 'announcement' | 'assignment';
    formData: FormData;
    onFieldChange: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
    attachments: File[];
    existingAttachments: IAttachmentRead[];
    onAddAttachment: (file: File) => void;
    onRemoveAttachment: (index: number) => void;
    onRemoveExistingAttachment: (index: number) => void;
    onFileUpload: (file: File) => Promise<string>;
    onPublish: () => void;
    publishLoading: boolean;
    publishError: string | null;
    isTeacher?: boolean;
}

export const PublicationFormCard = ({
    announcementId,
    publicationType,
    formData,
    onFieldChange,
    attachments,
    existingAttachments,
    onAddAttachment,
    onRemoveAttachment,
    onRemoveExistingAttachment,
    onFileUpload,
    onPublish,
    publishLoading,
    publishError,
    isTeacher = false
}: PublicationFormCardProps) => {
    return (
        <div className="card card-border bg-base-100 shadow-xl">
            <div className="card-body">
                <div className="flex items-center gap-3 mb-6">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                        publicationType === 'assignment' ? 'bg-secondary/10' : 'bg-primary/10'
                    }`}>
                        <span className={`iconify size-6 ${
                            publicationType === 'assignment'
                                ? 'lucide--clipboard-list text-secondary'
                                : 'lucide--megaphone text-primary'
                        }`}></span>
                    </div>
                    <div>
                        <h3 className="card-title text-xl text-base-content">
                            {announcementId
                                ? `Edición de ${publicationType === 'assignment' ? 'Tarea' : 'Aviso'}`
                                : `Crear Nueva ${publicationType === 'assignment' ? 'Tarea' : 'Aviso'}`
                            }
                        </h3>
                        <p className="text-sm text-base-content/60">
                            {announcementId
                                ? 'Edita la información de tu publicación'
                                : publicationType === 'assignment'
                                    ? 'Asigna tareas y actividades con fecha de entrega a los estudiantes'
                                    : 'Publica información importante para la comunidad educativa'
                            }
                        </p>
                    </div>
                </div>

                {/* Formulario */}
                <div className="space-y-6">
                    {/* Título */}
                    <fieldset className="fieldset w-full">
                        <legend className="fieldset-legend flex items-center gap-2">
                            <span className="iconify lucide--type size-4"></span>
                            Título del {publicationType === 'assignment' ? 'Tarea' : 'Aviso'}
                        </legend>
                        <label className="input input-primary w-full">
                            <span className="iconify lucide--edit-3 text-base-content/60 size-5"></span>
                            <input
                                className="grow w-full"
                                type="text"
                                placeholder={publicationType === 'assignment'
                                    ? "Ej: Tarea de Matemáticas, Proyecto de Ciencias..."
                                    : "Ej: Reunión de padres de familia, Suspensión de clases..."
                                }
                                value={formData.title}
                                onChange={(e) => onFieldChange('title', e.target.value)}
                            />
                        </label>
                        <p className="fieldset-label">* Campo requerido</p>
                    </fieldset>

                    {/* Campos de materia - Solo para tareas */}
                    {publicationType === 'assignment' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend flex items-center gap-2">
                                    <span className="iconify lucide--hash size-4"></span>
                                    MateriaId
                                </legend>
                                <label className={`input input-secondary ${isTeacher ? 'input-disabled' : ''}`}>
                                    <span className="iconify lucide--key text-base-content/60 size-5"></span>
                                    <input
                                        className="grow"
                                        type="text"
                                        placeholder="Ej: MAT101, SCI202..."
                                        value={formData.subjectId}
                                        onChange={(e) => onFieldChange('subjectId', e.target.value)}
                                        disabled={isTeacher}
                                        readOnly={isTeacher}
                                    />
                                </label>
                                <p className="fieldset-label">
                                    {isTeacher ? 'Seleccionado automáticamente' : 'ID de la materia'}
                                </p>
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend flex items-center gap-2">
                                    <span className="iconify lucide--book-open size-4"></span>
                                    Materia
                                </legend>
                                <label className={`input input-secondary ${isTeacher ? 'input-disabled' : ''}`}>
                                    <span className="iconify lucide--bookmark text-base-content/60 size-5"></span>
                                    <input
                                        className="grow"
                                        type="text"
                                        placeholder="Ej: Matemáticas, Ciencias..."
                                        value={formData.subjectName}
                                        onChange={(e) => onFieldChange('subjectName', e.target.value)}
                                        disabled={isTeacher}
                                        readOnly={isTeacher}
                                    />
                                </label>
                                <p className="fieldset-label">
                                    {isTeacher ? 'Seleccionada automáticamente' : 'Nombre de la materia'}
                                </p>
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend flex items-center gap-2">
                                    <span className="iconify lucide--calendar-clock size-4"></span>
                                    Fecha y hora de entrega
                                </legend>
                                <label className="input input-secondary">
                                    <span className="iconify lucide--calendar-days text-base-content/60 size-5"></span>
                                    <input
                                        className="grow"
                                        type="datetime-local"
                                        value={formData.dueDate}
                                        onChange={(e) => onFieldChange('dueDate', e.target.value)}
                                    />
                                </label>
                                <p className="fieldset-label">Fecha y hora límite de entrega</p>
                            </fieldset>
                        </div>
                    )}

                    {/* Contenido */}
                    <fieldset className="fieldset w-full">
                        <legend className="fieldset-legend flex items-center gap-2">
                            <span className="iconify lucide--file-text size-4"></span>
                            Contenido de la {publicationType === 'assignment' ? 'Tarea' : 'Aviso'}
                        </legend>
                        <div className="w-full">
                            <Editor
                                apiKey="a8bvz8ljrja6c147qm0xdh4nplqv7pmodepk5gnc6pgnx0ci"
                                init={{
                                    height: 600,
                                    menubar: true,
                                    plugins: [
                                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                    ],
                                    toolbar: 'undo redo | blocks | ' +
                                        'bold italic forecolor | alignleft aligncenter ' +
                                        'alignright alignjustify | bullist numlist outdent indent | ' +
                                        'image link | removeformat | help',
                                    content_style: `
                                        body {
                                            font-family: ui-sans-serif, system-ui, sans-serif;
                                            font-size: 14px;
                                            line-height: 1.6;
                                        }
                                    `,
                                    placeholder: publicationType === 'assignment'
                                        ? 'Describe los detalles de la tarea. Incluye instrucciones, objetivos, criterios de evaluación y recursos necesarios...'
                                        : 'Describe los detalles del aviso. Incluye fechas, horarios, ubicaciones y cualquier información relevante...',
                                    branding: false,
                                    resize: false,
                                    statusbar: false,
                                    images_upload_handler: (blobInfo: any) => new Promise(async (resolve, reject) => {
                                        try {
                                            const file = blobInfo.blob();
                                            const fileUrl = await onFileUpload(file);
                                            resolve(fileUrl);
                                        } catch (error) {
                                            reject(error);
                                        }
                                    }),
                                    paste_data_images: true,
                                    automatic_uploads: true,
                                    images_upload_url: '/api/upload',
                                    images_reuse_filename: true,
                                    file_picker_types: 'image',
                                    file_picker_callback: (callback: any, value: any, meta: any) => {
                                        if (meta.filetype === 'image') {
                                            const input = document.createElement('input');
                                            input.setAttribute('type', 'file');
                                            input.setAttribute('accept', 'image/*');
                                            input.addEventListener('change', async (e: any) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    try {
                                                        const fileUrl = await onFileUpload(file);
                                                        callback(fileUrl, { alt: file.name });
                                                    } catch (error) {
                                                        console.error('Error uploading file:', error);
                                                        alert('Error al subir el archivo');
                                                    }
                                                }
                                            });
                                            input.click();
                                        }
                                    },
                                }}
                                value={formData.content}
                                onEditorChange={(content) => onFieldChange('content', content)}
                            />
                        </div>
                        <p className="fieldset-label">Usa las herramientas del editor para dar formato a tu {publicationType === 'assignment' ? 'tarea' : 'aviso'}</p>
                    </fieldset>

                    {/* Fechas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend flex items-center gap-2">
                                <span className="iconify lucide--calendar size-4"></span>
                                Fecha y Hora de Inicio
                            </legend>
                            <label className="input input-success">
                                <span className="iconify lucide--calendar-days text-base-content/60 size-5"></span>
                                <input
                                    className="grow"
                                    type="datetime-local"
                                    value={formData.startDate}
                                    onChange={(e) => onFieldChange('startDate', e.target.value)}
                                />
                            </label>
                            <p className="fieldset-label">Cuándo inicia la vigencia</p>
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend flex items-center gap-2">
                                <span className="iconify lucide--calendar-x size-4"></span>
                                Fecha y Hora de Fin
                            </legend>
                            <label className="input input-warning">
                                <span className="iconify lucide--calendar-clock text-base-content/60 size-5"></span>
                                <input
                                    className="grow"
                                    type="datetime-local"
                                    value={formData.endDate}
                                    onChange={(e) => onFieldChange('endDate', e.target.value)}
                                />
                            </label>
                            <p className="fieldset-label">Cuándo expira {publicationType === 'assignment' ? 'la tarea' : 'el aviso'}</p>
                        </fieldset>
                    </div>

                    {/* Archivos Adjuntos */}
                    <AttachmentsManager
                        attachments={attachments}
                        existingAttachments={existingAttachments}
                        onAdd={onAddAttachment}
                        onRemove={onRemoveAttachment}
                        onRemoveExisting={onRemoveExistingAttachment}
                        publicationType={publicationType}
                    />

                    {/* Opciones adicionales */}
                    <div className="bg-base-200 rounded-xl p-4">
                        <h4 className="font-medium text-base-content mb-3 flex items-center gap-2">
                            <span className="iconify lucide--settings size-4"></span>
                            Configuración Adicional
                        </h4>
                        <div className="space-y-3">
                            <div className="form-control bg-base-100 rounded-lg p-3">
                                <label className="label cursor-pointer flex">
                                    <div className="flex items-center gap-3">
                                        <span className="iconify lucide--message-circle size-5 text-accent"></span>
                                        <div>
                                            <span className="label-text font-medium">Permitir comentarios</span>
                                            <div className="text-xs text-base-content/60">
                                                Los usuarios podrán comentar en esta {publicationType === 'assignment' ? 'tarea' : 'aviso'}
                                            </div>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-accent"
                                        checked={formData.acceptComments}
                                        onChange={(e) => onFieldChange('acceptComments', e.target.checked)}
                                    />
                                </label>
                            </div>

                            <div className="form-control bg-base-100 rounded-lg p-3">
                                <label className="label cursor-pointer flex">
                                    <div className="flex items-center gap-3">
                                        <span className="iconify lucide--shield-check size-5 text-success"></span>
                                        <div>
                                            <span className="label-text font-medium">Autorizar publicación</span>
                                            <div className="text-xs text-base-content/60">
                                                La publicación estará autorizada y visible para los destinatarios
                                            </div>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-success"
                                        checked={formData.authorized}
                                        onChange={(e) => onFieldChange('authorized', e.target.checked)}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error de publicación */}
                {publishError && (
                    <div className="alert alert-error shadow-lg">
                        <span className="iconify lucide--alert-circle size-6"></span>
                        <div>
                            <h3 className="font-bold">Error de validación</h3>
                            <div className="text-sm">{publishError}</div>
                        </div>
                    </div>
                )}

                {/* Acciones */}
                <div className="flex justify-end mt-8 pt-6 border-t border-base-300">
                    <button
                        className="btn btn-primary"
                        onClick={onPublish}
                        disabled={publishLoading}
                    >
                        {publishLoading ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                {announcementId ? 'Actualizando...' : 'Publicando...'}
                            </>
                        ) : (
                            <>
                                <span className="iconify lucide--send size-4"></span>
                                {announcementId
                                    ? `Actualizar ${publicationType === 'assignment' ? 'Tarea' : 'Aviso'}`
                                    : `Publicar ${publicationType === 'assignment' ? 'Tarea' : 'Aviso'}`
                                }
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
