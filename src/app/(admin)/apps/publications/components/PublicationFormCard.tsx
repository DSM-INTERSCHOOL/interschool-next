"use client";

import { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { AttachmentsManager } from "./AttachmentsManager";
import { IAttachmentRead } from "@/interfaces/IAnnouncement";
import { PublicationType } from "./PublicationTypeSelector";

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
    requiresConfirmation: boolean;
    requiresSignature: boolean;
    signatureType: string;
    confirmationLegend: string;
    signatureLegend: string;
    eventStartTime: string;
    eventDuration: string;
    confirmationDeadline: string;
    eventLocation: string;
    eventUrl: string;
    mapUrl: string;
    optionList1: string[];
    optionList2: string[];
    labelOption1: string;
    labelOption2: string;
}

interface PublicationFormCardProps {
    announcementId?: string;
    publicationType: PublicationType;
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
    const [newItem1, setNewItem1] = useState('');
    const [newItem2, setNewItem2] = useState('');
    const [active1, setActive1] = useState(false);
    const [active2, setActive2] = useState(false);

    // When loading an existing event, activate sections that already have data
    useEffect(() => {
        if (formData.optionList1.length > 0 || !!formData.labelOption1) setActive1(true);
    }, [formData.optionList1.length, formData.labelOption1]);

    useEffect(() => {
        if (formData.optionList2.length > 0 || !!formData.labelOption2) setActive2(true);
    }, [formData.optionList2.length, formData.labelOption2]);

    const addToList = (list: 'optionList1' | 'optionList2', value: string, setInput: (v: string) => void) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        onFieldChange(list, [...formData[list], trimmed]);
        setInput('');
    };

    const removeFromList = (list: 'optionList1' | 'optionList2', index: number) => {
        onFieldChange(list, formData[list].filter((_, i) => i !== index));
    };

    const deactivateList = (n: 1 | 2) => {
        if (n === 1) {
            setActive1(false);
            onFieldChange('optionList1', []);
            onFieldChange('labelOption1', '');
        } else {
            setActive2(false);
            onFieldChange('optionList2', []);
            onFieldChange('labelOption2', '');
        }
    };

    return (
        <div className="card card-border bg-base-100 shadow-xl">
            <div className="card-body">
                <div className="flex items-center gap-3 mb-6">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                        publicationType === 'assignment' ? 'bg-secondary/10'
                        : publicationType === 'event' ? 'bg-accent/10'
                        : 'bg-primary/10'
                    }`}>
                        <span className={`iconify size-6 ${
                            publicationType === 'assignment' ? 'lucide--clipboard-list text-secondary'
                            : publicationType === 'event' ? 'lucide--calendar-days text-accent'
                            : 'lucide--megaphone text-primary'
                        }`}></span>
                    </div>
                    <div>
                        <h3 className="card-title text-xl text-base-content">
                            {announcementId
                                ? `Edición de ${publicationType === 'assignment' ? 'Tarea' : publicationType === 'event' ? 'Evento' : 'Aviso'}`
                                : `Crear ${publicationType === 'assignment' ? 'Nueva Tarea' : publicationType === 'event' ? 'Nuevo Evento' : 'Nuevo Aviso'}`
                            }
                        </h3>
                        <p className="text-sm text-base-content/60">
                            {announcementId
                                ? 'Edita la información de tu publicación'
                                : publicationType === 'assignment'
                                    ? 'Asigna tareas y actividades con fecha de entrega a los estudiantes'
                                    : publicationType === 'event'
                                        ? 'Publica eventos con opciones de confirmación y firma de asistencia'
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
                                <label className="input input-secondary">
                                    <span className="iconify lucide--key text-base-content/60 size-5"></span>
                                    <input
                                        className="grow"
                                        type="text"
                                        placeholder="Ej: MAT101, SCI202..."
                                        value={formData.subjectId}
                                        onChange={(e) => onFieldChange('subjectId', e.target.value)}
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
                                <label className="input input-secondary">
                                    <span className="iconify lucide--bookmark text-base-content/60 size-5"></span>
                                    <input
                                        className="grow"
                                        type="text"
                                        placeholder="Ej: Matemáticas, Ciencias..."
                                        value={formData.subjectName}
                                        onChange={(e) => onFieldChange('subjectName', e.target.value)}
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
                                    file_picker_callback: (callback: any, _value: any, meta: any) => {
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
                                Fecha y Hora Inicio de Publicación
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

                        {publicationType !== 'event' && (
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend flex items-center gap-2">
                                    <span className="iconify lucide--calendar-x size-4"></span>
                                    Fecha y Hora de Fin de Publicación
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
                        )}
                    </div>

                    {/* Hora del evento - Solo para eventos */}
                    {publicationType === 'event' && (
                        <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend flex items-center gap-2">
                                    <span className="iconify lucide--clock size-4"></span>
                                    Inicio del Evento
                                </legend>
                                <label className="input input-accent">
                                    <span className="iconify lucide--clock-3 text-base-content/60 size-5"></span>
                                    <input
                                        className="grow"
                                        type="datetime-local"
                                        value={formData.eventStartTime}
                                        onChange={(e) => onFieldChange('eventStartTime', e.target.value)}
                                    />
                                </label>
                                <p className="fieldset-label">Cuándo inicia el evento</p>
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend flex items-center gap-2">
                                    <span className="iconify lucide--timer size-4"></span>
                                    Duración
                                </legend>
                                <select
                                    className="select select-accent w-full"
                                    value={formData.eventDuration}
                                    onChange={(e) => onFieldChange('eventDuration', e.target.value)}
                                >
                                    {[30, 60, 90, 120, 150, 180, 210, 240].map(min => (
                                        <option key={min} value={min.toString()}>
                                            {min < 60
                                                ? `${min} min`
                                                : min % 60 === 0
                                                    ? `${min / 60} hora${min / 60 > 1 ? 's' : ''}`
                                                    : `${Math.floor(min / 60)} hora${Math.floor(min / 60) > 1 ? 's' : ''} 30 min`
                                            }
                                        </option>
                                    ))}
                                    <option value="allday">Todo el día</option>
                                </select>
                                <p className="fieldset-label">La vigencia expirará al día siguiente</p>
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend flex items-center gap-2">
                                    <span className="iconify lucide--calendar-clock size-4"></span>
                                    Límite de confirmación
                                </legend>
                                <label className="input input-accent">
                                    <span className="iconify lucide--hourglass text-base-content/60 size-5"></span>
                                    <input
                                        className="grow"
                                        type="datetime-local"
                                        value={formData.confirmationDeadline}
                                        onChange={(e) => onFieldChange('confirmationDeadline', e.target.value)}
                                    />
                                </label>
                                <p className="fieldset-label">Calculado como fin del evento − 1 día</p>
                            </fieldset>

                        </div>

                        {/* Ubicación y enlaces */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend flex items-center gap-2">
                                    <span className="iconify lucide--map-pin size-4"></span>
                                    Lugar
                                </legend>
                                <label className="input input-accent w-full">
                                    <span className="iconify lucide--map-pin text-base-content/60 size-5"></span>
                                    <input
                                        className="grow"
                                        type="text"
                                        placeholder="Ej: Auditorio principal, Salón 3A..."
                                        value={formData.eventLocation}
                                        onChange={(e) => onFieldChange('eventLocation', e.target.value)}
                                    />
                                </label>
                                <p className="fieldset-label">Dónde se realizará el evento</p>
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend flex items-center gap-2">
                                    <span className="iconify lucide--link size-4"></span>
                                    URL del Evento
                                </legend>
                                <label className="input input-accent w-full">
                                    <span className="iconify lucide--link text-base-content/60 size-5"></span>
                                    <input
                                        className="grow"
                                        type="url"
                                        placeholder="https://..."
                                        value={formData.eventUrl}
                                        onChange={(e) => onFieldChange('eventUrl', e.target.value)}
                                    />
                                </label>
                                <p className="fieldset-label">Enlace al evento o transmisión</p>
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend flex items-center gap-2">
                                    <span className="iconify lucide--map size-4"></span>
                                    URL del Mapa
                                </legend>
                                <label className="input input-accent w-full">
                                    <span className="iconify lucide--navigation text-base-content/60 size-5"></span>
                                    <input
                                        className="grow"
                                        type="url"
                                        placeholder="https://maps.google.com/..."
                                        value={formData.mapUrl}
                                        onChange={(e) => onFieldChange('mapUrl', e.target.value)}
                                    />
                                </label>
                                <p className="fieldset-label">Enlace a Google Maps u otro mapa</p>
                            </fieldset>
                        </div>

                        {/* Lista de opciones 1 */}
                        <div className="form-control bg-base-100 rounded-lg p-3 border border-base-300">
                            <label className="label cursor-pointer flex">
                                <div className="flex items-center gap-3">
                                    <span className="iconify lucide--list size-5 text-accent"></span>
                                    <div>
                                        <span className="label-text font-medium">Activar lista de opciones 1</span>
                                        <div className="text-xs text-base-content/60">Lista personalizada de valores para este evento</div>
                                    </div>
                                </div>
                                <input type="checkbox" className="checkbox checkbox-accent" checked={active1}
                                    onChange={(e) => { if (e.target.checked) setActive1(true); else deactivateList(1); }} />
                            </label>
                            {active1 && (
                                <div className="mt-3 space-y-3 pt-3 border-t border-base-200">
                                    <fieldset className="fieldset">
                                        <legend className="fieldset-legend flex items-center gap-2">
                                            <span className="iconify lucide--tag size-4"></span>
                                            Etiqueta de la lista
                                        </legend>
                                        <label className="input input-accent w-full">
                                            <span className="iconify lucide--text text-base-content/60 size-5"></span>
                                            <input className="grow" type="text"
                                                placeholder="Ej: Opciones de transporte, Tallas disponibles..."
                                                value={formData.labelOption1}
                                                onChange={(e) => onFieldChange('labelOption1', e.target.value)} />
                                        </label>
                                        <p className="fieldset-label">Nombre o descripción de la lista</p>
                                    </fieldset>
                                    <div className="flex gap-2">
                                        <label className="input input-accent flex-1">
                                            <span className="iconify lucide--plus text-base-content/60 size-5"></span>
                                            <input className="grow" type="text" placeholder="Escribe un valor y presiona Agregar..."
                                                value={newItem1} onChange={(e) => setNewItem1(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToList('optionList1', newItem1, setNewItem1); } }} />
                                        </label>
                                        <button type="button" className="btn btn-accent btn-outline"
                                            onClick={() => addToList('optionList1', newItem1, setNewItem1)}>
                                            <span className="iconify lucide--plus size-4"></span>Agregar
                                        </button>
                                    </div>
                                    {formData.optionList1.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.optionList1.map((item, idx) => (
                                                <span key={idx} className="badge badge-accent badge-outline gap-1 py-3 px-3 text-sm">
                                                    {item}
                                                    <button type="button" onClick={() => removeFromList('optionList1', idx)}
                                                        className="ml-1 hover:text-error transition-colors">
                                                        <span className="iconify lucide--x size-3"></span>
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-base-content/40 italic">Sin elementos aún — agrega el primero arriba.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Lista de opciones 2 */}
                        <div className="form-control bg-base-100 rounded-lg p-3 border border-base-300">
                            <label className="label cursor-pointer flex">
                                <div className="flex items-center gap-3">
                                    <span className="iconify lucide--list size-5 text-accent"></span>
                                    <div>
                                        <span className="label-text font-medium">Activar lista de opciones 2</span>
                                        <div className="text-xs text-base-content/60">Lista personalizada de valores para este evento</div>
                                    </div>
                                </div>
                                <input type="checkbox" className="checkbox checkbox-accent" checked={active2}
                                    onChange={(e) => { if (e.target.checked) setActive2(true); else deactivateList(2); }} />
                            </label>
                            {active2 && (
                                <div className="mt-3 space-y-3 pt-3 border-t border-base-200">
                                    <fieldset className="fieldset">
                                        <legend className="fieldset-legend flex items-center gap-2">
                                            <span className="iconify lucide--tag size-4"></span>
                                            Etiqueta de la lista
                                        </legend>
                                        <label className="input input-accent w-full">
                                            <span className="iconify lucide--text text-base-content/60 size-5"></span>
                                            <input className="grow" type="text"
                                                placeholder="Ej: Opciones de transporte, Tallas disponibles..."
                                                value={formData.labelOption2}
                                                onChange={(e) => onFieldChange('labelOption2', e.target.value)} />
                                        </label>
                                        <p className="fieldset-label">Nombre o descripción de la lista</p>
                                    </fieldset>
                                    <div className="flex gap-2">
                                        <label className="input input-accent flex-1">
                                            <span className="iconify lucide--plus text-base-content/60 size-5"></span>
                                            <input className="grow" type="text" placeholder="Escribe un valor y presiona Agregar..."
                                                value={newItem2} onChange={(e) => setNewItem2(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToList('optionList2', newItem2, setNewItem2); } }} />
                                        </label>
                                        <button type="button" className="btn btn-accent btn-outline"
                                            onClick={() => addToList('optionList2', newItem2, setNewItem2)}>
                                            <span className="iconify lucide--plus size-4"></span>Agregar
                                        </button>
                                    </div>
                                    {formData.optionList2.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.optionList2.map((item, idx) => (
                                                <span key={idx} className="badge badge-accent badge-outline gap-1 py-3 px-3 text-sm">
                                                    {item}
                                                    <button type="button" onClick={() => removeFromList('optionList2', idx)}
                                                        className="ml-1 hover:text-error transition-colors">
                                                        <span className="iconify lucide--x size-3"></span>
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-base-content/40 italic">Sin elementos aún — agrega el primero arriba.</p>
                                    )}
                                </div>
                            )}
                        </div>
                        </>
                    )}

                    {/* Configuración del Evento - Solo para eventos */}
                    {publicationType === 'event' && (
                        <div className="bg-accent/5 border border-accent/20 rounded-xl p-5 space-y-4">
                            <h4 className="font-medium text-base-content flex items-center gap-2">
                                <span className="iconify lucide--calendar-check size-4 text-accent"></span>
                                Configuración del Evento
                            </h4>

                            {/* Requiere confirmación */}
                            <div className="form-control bg-base-100 rounded-lg p-3">
                                <label className="label cursor-pointer flex">
                                    <div className="flex items-center gap-3">
                                        <span className="iconify lucide--check-square size-5 text-accent"></span>
                                        <div>
                                            <span className="label-text font-medium">Requiere confirmación de asistencia</span>
                                            <div className="text-xs text-base-content/60">
                                                Los destinatarios deberán confirmar su asistencia al evento
                                            </div>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-accent"
                                        checked={formData.requiresConfirmation}
                                        onChange={(e) => onFieldChange('requiresConfirmation', e.target.checked)}
                                    />
                                </label>
                            </div>

                            {formData.requiresConfirmation && (
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend flex items-center gap-2">
                                        <span className="iconify lucide--message-square size-4"></span>
                                        Leyenda de confirmación
                                    </legend>
                                    <label className="input input-accent w-full">
                                        <span className="iconify lucide--text text-base-content/60 size-5"></span>
                                        <input
                                            className="grow"
                                            type="text"
                                            placeholder="Ej: Asistiré al evento"
                                            value={formData.confirmationLegend}
                                            onChange={(e) => onFieldChange('confirmationLegend', e.target.value)}
                                        />
                                    </label>
                                    <p className="fieldset-label">Texto que verá el usuario al confirmar</p>
                                </fieldset>
                            )}

                            {/* Requiere firma */}
                            <div className="form-control bg-base-100 rounded-lg p-3">
                                <label className="label cursor-pointer flex">
                                    <div className="flex items-center gap-3">
                                        <span className="iconify lucide--pen-line size-5 text-accent"></span>
                                        <div>
                                            <span className="label-text font-medium">Requiere firma</span>
                                            <div className="text-xs text-base-content/60">
                                                Los destinatarios deberán firmar digitalmente para confirmar
                                            </div>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-accent"
                                        checked={formData.requiresSignature}
                                        onChange={(e) => onFieldChange('requiresSignature', e.target.checked)}
                                    />
                                </label>
                            </div>

                            {formData.requiresSignature && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <fieldset className="fieldset">
                                        <legend className="fieldset-legend flex items-center gap-2">
                                            <span className="iconify lucide--lock size-4"></span>
                                            Tipo de firma
                                        </legend>
                                        <select
                                            className="select select-accent w-full"
                                            value={formData.signatureType}
                                            onChange={(e) => onFieldChange('signatureType', e.target.value)}
                                        >
                                            <option value="PASSWORD">Contraseña</option>
                                            <option value="PIN">PIN</option>
                                        </select>
                                        <p className="fieldset-label">Método de autenticación de la firma</p>
                                    </fieldset>

                                    <fieldset className="fieldset">
                                        <legend className="fieldset-legend flex items-center gap-2">
                                            <span className="iconify lucide--message-square size-4"></span>
                                            Leyenda de firma
                                        </legend>
                                        <label className="input input-accent w-full">
                                            <span className="iconify lucide--text text-base-content/60 size-5"></span>
                                            <input
                                                className="grow"
                                                type="text"
                                                placeholder="Ej: Estoy de acuerdo con los términos"
                                                value={formData.signatureLegend}
                                                onChange={(e) => onFieldChange('signatureLegend', e.target.value)}
                                            />
                                        </label>
                                        <p className="fieldset-label">Texto que verá el usuario al firmar</p>
                                    </fieldset>
                                </div>
                            )}
                        </div>
                    )}

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
