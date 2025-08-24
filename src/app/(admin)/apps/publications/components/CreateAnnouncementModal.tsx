"use client";

import { useState } from "react";
import { XMarkIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { IAnnouncementCreate, IAnnouncementRead } from "@/interfaces/IAnnouncement";
import { create } from "@/services/announcement.service";

interface CreateAnnouncementModalProps {
    onClose: () => void;
    onSuccess: (announcement: IAnnouncementRead) => void;
}

const CreateAnnouncementModal = ({ onClose, onSuccess }: CreateAnnouncementModalProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<IAnnouncementCreate>({
        title: "",
        content: "",
        start_date: "",
        end_date: "",
        accept_comments: true,
        authorized: false,
        academic_year: "2024-2025",
        academic_stages: [],
        academic_programs: [],
        academic_modalities: [],
        academic_program_years: [],
        academic_groups: [],
        status: "pending",
        publisher_person_id: "current-user-id", // Esto vendría del contexto de autenticación
        persons: [],
        attachments: []
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Opciones para los selectores
    const academicStages = [
        { value: "preescolar", label: "Preescolar" },
        { value: "primaria", label: "Primaria" },
        { value: "secundaria", label: "Secundaria" },
        { value: "preparatoria", label: "Preparatoria" }
    ];

    const academicPrograms = [
        { value: "general", label: "General" },
        { value: "bilingue", label: "Bilingüe" },
        { value: "tecnologico", label: "Tecnológico" }
    ];

    const academicModalities = [
        { value: "presencial", label: "Presencial" },
        { value: "hibrido", label: "Híbrido" },
        { value: "virtual", label: "Virtual" }
    ];

    const academicYears = [
        { value: "1", label: "1er Año" },
        { value: "2", label: "2do Año" },
        { value: "3", label: "3er Año" },
        { value: "4", label: "4to Año" },
        { value: "5", label: "5to Año" },
        { value: "6", label: "6to Año" }
    ];

    const academicGroups = [
        { value: "1A", label: "1°A" },
        { value: "1B", label: "1°B" },
        { value: "2A", label: "2°A" },
        { value: "2B", label: "2°B" },
        { value: "3A", label: "3°A" },
        { value: "3B", label: "3°B" }
    ];

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title?.trim()) {
            newErrors.title = "El título es requerido";
        }

        if (!formData.content?.trim()) {
            newErrors.content = "El contenido es requerido";
        }

        if (!formData.start_date) {
            newErrors.start_date = "La fecha de inicio es requerida";
        }

        if (!formData.end_date) {
            newErrors.end_date = "La fecha de fin es requerida";
        }

        if (formData.start_date && formData.end_date && 
            new Date(formData.start_date) >= new Date(formData.end_date)) {
            newErrors.end_date = "La fecha de fin debe ser posterior a la fecha de inicio";
        }

        if (formData.persons.length === 0) {
            newErrors.persons = "Debe seleccionar al menos un destinatario";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            // En producción, usar el servicio real:
            // const newAnnouncement = await create({ schoolId: 1, dto: formData });
            
            // Por ahora simular la creación
            const newAnnouncement: IAnnouncementRead = {
                title: formData.title || null,
                content: formData.content || null,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
                accept_comments: formData.accept_comments || false,
                views: 0,
                likes: 0,
                comments: 0,
                authorized: formData.authorized || false,
                authorized_by: formData.authorized_by || null,
                authorized_on: formData.authorized_on || null,
                academic_year: formData.academic_year || null,
                academic_stages: formData.academic_stages || null,
                academic_programs: formData.academic_programs || null,
                academic_modalities: formData.academic_modalities || null,
                academic_program_years: formData.academic_program_years || null,
                academic_groups: formData.academic_groups || null,
                status: formData.status || null,
                id: Math.random().toString(36).substr(2, 9),
                school_id: 1,
                created_at: new Date().toISOString(),
                modified_at: new Date().toISOString(),
                created_by: "current-user-id",
                modified_by: "current-user-id",
                attachments: formData.attachments ? formData.attachments.map(attachment => ({
                    id: Math.random().toString(36).substr(2, 9),
                    filename: attachment.filename,
                    content_type: attachment.content_type,
                    size: attachment.size,
                    url: attachment.url || null,
                    created_at: new Date().toISOString(),
                    modified_at: new Date().toISOString()
                })) : null,
                publisher: {
                    id: "current-user-id",
                    first_name: "Usuario",
                    last_name: "Actual",
                    email: "usuario@escuela.edu",
                    phone: "+1234567890"
                },
                user_liked: false
            };

            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            onSuccess(newAnnouncement);
        } catch (error) {
            console.error("Error creating announcement:", error);
            setErrors({ submit: "Error al crear el aviso. Inténtalo de nuevo." });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof IAnnouncementCreate, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const handleMultiSelectChange = (field: keyof IAnnouncementCreate, value: string, checked: boolean) => {
        const currentValues = formData[field] as string[] || [];
        const newValues = checked 
            ? [...currentValues, value]
            : currentValues.filter(v => v !== value);
        
        handleInputChange(field, newValues);
    };

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center z-50 p-4 transition-opacity duration-200"
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(4px)'
            }}
        >
            <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-base-300">
                    <h2 className="text-xl font-semibold text-base-content">
                        Crear Nuevo Aviso
                    </h2>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-circle"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Información básica */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Título *</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title || ""}
                                    onChange={(e) => handleInputChange("title", e.target.value)}
                                    className={`input input-bordered w-full ${errors.title ? 'input-error' : ''}`}
                                    placeholder="Título del aviso"
                                />
                                {errors.title && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.title}</span>
                                    </label>
                                )}
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Contenido *</span>
                                </label>
                                <textarea
                                    value={formData.content || ""}
                                    onChange={(e) => handleInputChange("content", e.target.value)}
                                    className={`textarea textarea-bordered w-full h-32 ${errors.content ? 'textarea-error' : ''}`}
                                    placeholder="Descripción detallada del aviso..."
                                />
                                {errors.content && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.content}</span>
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Fecha de Inicio *</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.start_date || ""}
                                    onChange={(e) => handleInputChange("start_date", e.target.value)}
                                    className={`input input-bordered w-full ${errors.start_date ? 'input-error' : ''}`}
                                />
                                {errors.start_date && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.start_date}</span>
                                    </label>
                                )}
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Fecha de Fin *</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.end_date || ""}
                                    onChange={(e) => handleInputChange("end_date", e.target.value)}
                                    className={`input input-bordered w-full ${errors.end_date ? 'input-error' : ''}`}
                                />
                                {errors.end_date && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.end_date}</span>
                                    </label>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <label className="label cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.accept_comments || false}
                                        onChange={(e) => handleInputChange("accept_comments", e.target.checked)}
                                        className="checkbox checkbox-primary"
                                    />
                                    <span className="label-text ml-2">Permitir comentarios</span>
                                </label>

                                <label className="label cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.authorized || false}
                                        onChange={(e) => handleInputChange("authorized", e.target.checked)}
                                        className="checkbox checkbox-primary"
                                    />
                                    <span className="label-text ml-2">Autorizado</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Configuración académica */}
                    <div className="border-t border-base-300 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Ciclo</span>
                                </label>
                                <select
                                    value={formData.academic_year || ""}
                                    onChange={(e) => handleInputChange("academic_year", e.target.value)}
                                    className="select select-bordered w-full"
                                >
                                    <option value="">Seleccionar año</option>
                                    <option value="2023-2024">2023-2024</option>
                                    <option value="2024-2025">2024-2025</option>
                                    <option value="2025-2026">2025-2026</option>
                                </select>
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Grado</span>
                                </label>
                                <div className="space-y-2 max-h-32 overflow-y-auto border border-base-300 rounded-lg p-3">
                                    {academicStages.map((stage) => (
                                        <label key={stage.value} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.academic_stages?.includes(stage.value) || false}
                                                onChange={(e) => handleMultiSelectChange("academic_stages", stage.value, e.target.checked)}
                                                className="checkbox checkbox-sm"
                                            />
                                            <span className="text-sm">{stage.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Programas Académicos</span>
                                </label>
                                <div className="space-y-2 max-h-32 overflow-y-auto border border-base-300 rounded-lg p-3">
                                    {academicPrograms.map((program) => (
                                        <label key={program.value} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.academic_programs?.includes(program.value) || false}
                                                onChange={(e) => handleMultiSelectChange("academic_programs", program.value, e.target.checked)}
                                                className="checkbox checkbox-sm"
                                            />
                                            <span className="text-sm">{program.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Modalidades</span>
                                </label>
                                <div className="space-y-2 max-h-32 overflow-y-auto border border-base-300 rounded-lg p-3">
                                    {academicModalities.map((modality) => (
                                        <label key={modality.value} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.academic_modalities?.includes(modality.value) || false}
                                                onChange={(e) => handleMultiSelectChange("academic_modalities", modality.value, e.target.checked)}
                                                className="checkbox checkbox-sm"
                                            />
                                            <span className="text-sm">{modality.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Años de Programa</span>
                                </label>
                                <div className="space-y-2 max-h-32 overflow-y-auto border border-base-300 rounded-lg p-3">
                                    {academicYears.map((year) => (
                                        <label key={year.value} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.academic_program_years?.includes(year.value) || false}
                                                onChange={(e) => handleMultiSelectChange("academic_program_years", year.value, e.target.checked)}
                                                className="checkbox checkbox-sm"
                                            />
                                            <span className="text-sm">{year.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="label">
                                    <span className="label-text font-medium">Grupos Académicos</span>
                                </label>
                                <div className="space-y-2 max-h-32 overflow-y-auto border border-base-300 rounded-lg p-3">
                                    {academicGroups.map((group) => (
                                        <label key={group.value} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.academic_groups?.includes(group.value) || false}
                                                onChange={(e) => handleMultiSelectChange("academic_groups", group.value, e.target.checked)}
                                                className="checkbox checkbox-sm"
                                            />
                                            <span className="text-sm">{group.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Destinatarios */}
                    <div className="border-t border-base-300 pt-6">
                        <h3 className="text-lg font-medium text-base-content mb-4">
                            Destinatarios
                        </h3>
                        
                        <div className="bg-base-200 rounded-lg p-4">
                            <p className="text-sm text-base-content/70 mb-4">
                                Los destinatarios se determinarán automáticamente basándose en la configuración académica seleccionada.
                            </p>
                            
                            {/* Aquí se mostrarían los destinatarios calculados */}
                            <div className="bg-base-100 rounded-lg p-3">
                                <p className="text-sm font-medium text-base-content">
                                    Destinatarios estimados: {formData.persons.length || 0} personas
                                </p>
                                <p className="text-xs text-base-content/70">
                                    (Estudiantes, padres y personal según la configuración)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Errores generales */}
                    {errors.submit && (
                        <div className="alert alert-error">
                            <span>{errors.submit}</span>
                        </div>
                    )}

                    {/* Acciones */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-base-300">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                <PaperAirplaneIcon className="w-5 h-5" />
                            )}
                            Crear Aviso
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAnnouncementModal;
