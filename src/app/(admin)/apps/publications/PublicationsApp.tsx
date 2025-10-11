"use client";

import { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { IAcademicYear } from "@/interfaces/IAcademicYear";
import { IAcademicStage } from "@/interfaces/IAcademicStage";
import { IAcademicProgram } from "@/interfaces/IAcademicProgram";
import { IProgramYear } from "@/interfaces/IProgramYear";
import { IAcademicGroup } from "@/interfaces/IAcademicGroup";
import { IRecipient, PersonType } from "@/interfaces/IRecipient";
import { getActiveAcademicYears } from "@/services/academic-year.service";
import { getAcademicStagesByPrecedence } from "@/services/academic-stage.service";
import { getAcademicProgramsByStages } from "@/services/academic-program.service";
import { getProgramYearsByStagesAndPrograms } from "@/services/program-year.service";
import { getAcademicGroupsByProgramYears } from "@/services/academic-group.service";
import { getRecipientsWithEnrollmentFilters } from "@/services/recipient.service";
import { create, getById, update } from "@/services/announcement.service";
import * as assignmentService from "@/services/assignment.service";
import { IAnnouncementCreate, IAnnouncementRead, IAttachmentCreate, IAttachmentRead } from "@/interfaces/IAnnouncement";
import { useAuthStore } from "@/store/useAuthStore";
import { communicationService } from "@/services/communication.service";
import { DestinatariosInfo } from "./DestinatariosInfo";

interface PublicationsAppProps {
    announcementId?: string;
    type?: 'announcement' | 'assignment';
}

const PublicationsApp = ({ announcementId, type }: PublicationsAppProps) => {
    const [publicationType, setPublicationType] = useState<'announcement' | 'assignment'>(type || 'announcement');
    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [selectedAcademicYears, setSelectedAcademicYears] = useState<Set<number>>(new Set());
    const [academicStages, setAcademicStages] = useState<IAcademicStage[]>([]);
    const [selectedAcademicStages, setSelectedAcademicStages] = useState<Set<number>>(new Set());
    const [academicPrograms, setAcademicPrograms] = useState<IAcademicProgram[]>([]);
    const [selectedAcademicPrograms, setSelectedAcademicPrograms] = useState<Set<number>>(new Set());
    const [programYears, setProgramYears] = useState<IProgramYear[]>([]);
    const [selectedProgramYears, setSelectedProgramYears] = useState<Set<number>>(new Set());
    const [academicGroups, setAcademicGroups] = useState<IAcademicGroup[]>([]);
    const [selectedAcademicGroups, setSelectedAcademicGroups] = useState<Set<number>>(new Set());
    const [selectedRecipientTypes, setSelectedRecipientTypes] = useState<Set<string>>(new Set());
    const [recipients, setRecipients] = useState<IRecipient[]>([]);
    const [selectedRecipients, setSelectedRecipients] = useState<Set<number>>(new Set());
    const [recipientsLoading, setRecipientsLoading] = useState(false);
    const [recipientsError, setRecipientsError] = useState<string | null>(null);
    const [announcementContent, setAnnouncementContent] = useState<string>('');
    const [announcementTitle, setAnnouncementTitle] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [acceptComments, setAcceptComments] = useState<boolean>(true);
    const [authorized, setAuthorized] = useState<boolean>(true);
    const [publishLoading, setPublishLoading] = useState(false);
    const [publishError, setPublishError] = useState<string | null>(null);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [existingAttachments, setExistingAttachments] = useState<IAttachmentRead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [subjectId, setSubjectId] = useState<string>('');
    const [subjectName, setSubjectName] = useState<string>('');
    const [dueDate, setDueDate] = useState<string>('');

    // Get auth data
    const { personId } = useAuthStore();

    // Handle file upload for TinyMCE (images in editor content)
    const handleFileUpload = async (file: File): Promise<string> => {
        try {
            const schoolId = process.env.NEXT_PUBLIC_SCHOOL_ID || "1000";
            const result = await communicationService.uploadAttachment(schoolId, file);

            console.log("Upload result:", result);
            console.log("Using public_url for TinyMCE:", result.public_url);

            // Return the public URL for TinyMCE preview
            return result.public_url;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw new Error("Error al subir el archivo");
        }
    };

    // Handle attachment files (separate from editor images)
    const handleAddAttachment = (file: File) => {
        setAttachments(prev => [...prev, file]);
    };

    const handleRemoveAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingAttachment = (index: number) => {
        setExistingAttachments(prev => prev.filter((_, i) => i !== index));
    };

    // Cargar años académicos y niveles académicos
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Cargar ambos en paralelo
                const [years, stages] = await Promise.all([
                    getActiveAcademicYears(),
                    getAcademicStagesByPrecedence()
                ]);
                
                setAcademicYears(years);
                setAcademicStages(stages);
            } catch (err: any) {
                console.error("Error loading data:", err);
                setError(err.message || "Error al cargar datos");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // State para almacenar el announcement cargado
    const [loadedAnnouncement, setLoadedAnnouncement] = useState<IAnnouncementRead | null>(null);

    // Cargar announcement existente si hay announcementId
    useEffect(() => {
        const loadPublication = async () => {
            if (!announcementId) return;

            try {
                setLoading(true);
                const schoolId = process.env.NEXT_PUBLIC_SCHOOL_ID || "1000";
                let publication;

                // Cargar según el tipo de publicación
                if (publicationType === 'assignment') {
                    publication = await assignmentService.getById({ schoolId, assignmentId: announcementId });
                } else {
                    publication = await getById({ schoolId, announcementId });
                }

                // Guardar la publicación cargada
                setLoadedAnnouncement(publication);

                // Prellenar el formulario con los datos de la publicación
                setAnnouncementTitle(publication.title || '');
                setAnnouncementContent(publication.content || '');
                setStartDate(publication.start_date ? publication.start_date.split('T')[0] : '');
                setEndDate(publication.end_date ? publication.end_date.split('T')[0] : '');
                setAcceptComments(publication.accept_comments ?? true);
                setAuthorized(publication.authorized ?? true);

                // Para assignments, cargar campos adicionales
                if (publicationType === 'assignment' && 'subject_id' in publication) {
                    setSubjectId((publication as any).subject_id || '');
                    setSubjectName((publication as any).subject_name || '');
                    setDueDate((publication as any).due_date ? (publication as any).due_date.split('T')[0] : '');
                }

                // Cargar attachments existentes
                if (publication.attachments && publication.attachments.length > 0) {
                    setExistingAttachments(publication.attachments);
                }
            } catch (err: any) {
                console.error("Error loading publication:", err);
                setError(err.message || "Error al cargar la publicación");
            } finally {
                setLoading(false);
            }
        };

        loadPublication();
    }, [announcementId, publicationType]);

    // Prellenar selecciones académicas cuando se carguen los datos y el announcement
    useEffect(() => {
        if (!loadedAnnouncement || academicYears.length === 0) return;
        console.log({loadedAnnouncement})
        console.log({academicYears})

        // Prellenar academic_years usando academic_year_key
        if (loadedAnnouncement.academic_years) {
            const yearIds = loadedAnnouncement.academic_years
                .map(yearKey => {
                    const year = academicYears.find(y => y.id === parseInt(yearKey));
                    console.log({ yearKey})
                    return year?.id;
                })
                .filter((id): id is number => id !== undefined);
                console.log({yearIds})
            setSelectedAcademicYears(new Set(yearIds));
        }

        // Prellenar otras selecciones (convertir strings a números)
        if (loadedAnnouncement.academic_stages) {
            setSelectedAcademicStages(new Set(loadedAnnouncement.academic_stages.map(s => parseInt(s))));
        }
        if (loadedAnnouncement.academic_programs) {
            setSelectedAcademicPrograms(new Set(loadedAnnouncement.academic_programs.map(p => parseInt(p))));
        }
        if (loadedAnnouncement.academic_program_years) {
            setSelectedProgramYears(new Set(loadedAnnouncement.academic_program_years.map(py => parseInt(py))));
        }
        if (loadedAnnouncement.academic_groups) {
            setSelectedAcademicGroups(new Set(loadedAnnouncement.academic_groups.map(g => parseInt(g))));
        }
    }, [loadedAnnouncement, academicYears]);

    // Cargar programas académicos cuando cambian los stages seleccionados
    useEffect(() => {
        const loadAcademicPrograms = async () => {
            try {
                if (selectedAcademicStages.size > 0) {
                    const stageIds = Array.from(selectedAcademicStages);
                    const programs = await getAcademicProgramsByStages(stageIds);
                    setAcademicPrograms(programs);
                } else {
                    setAcademicPrograms([]);
                    setSelectedAcademicPrograms(new Set());
                }
            } catch (err: any) {
                console.error("Error loading academic programs:", err);
                setAcademicPrograms([]);
            }
        };

        loadAcademicPrograms();
    }, [selectedAcademicStages]);

    // Cargar años de programa cuando cambian los stages y programs seleccionados
    useEffect(() => {
        const loadProgramYears = async () => {
            try {
                if (selectedAcademicStages.size > 0 && selectedAcademicPrograms.size > 0) {
                    const stageIds = Array.from(selectedAcademicStages);
                    const programIds = Array.from(selectedAcademicPrograms);
                    const years = await getProgramYearsByStagesAndPrograms(stageIds, programIds);
                    setProgramYears(years);
                } else {
                    setProgramYears([]);
                    setSelectedProgramYears(new Set());
                }
            } catch (err: any) {
                console.error("Error loading program years:", err);
                setProgramYears([]);
            }
        };

        loadProgramYears();
    }, [selectedAcademicStages, selectedAcademicPrograms]);

    // Cargar grupos académicos cuando cambian los program years seleccionados
    useEffect(() => {
        const loadAcademicGroups = async () => {
            try {
                if (selectedProgramYears.size > 0) {
                    const programYearIds = Array.from(selectedProgramYears);
                    const groups = await getAcademicGroupsByProgramYears(programYearIds);
                    setAcademicGroups(groups);
                } else {
                    setAcademicGroups([]);
                    setSelectedAcademicGroups(new Set());
                }
            } catch (err: any) {
                console.error("Error loading academic groups:", err);
                setAcademicGroups([]);
            }
        };

        loadAcademicGroups();
    }, [selectedProgramYears]);

    // Función para cargar recipients manualmente
    const loadRecipients = async () => {
        try {
            // Limpiar errores previos
            setRecipientsError(null);

            if (selectedRecipientTypes.size === 0) {
                setRecipientsError("Debe seleccionar al menos un tipo de destinatario");
                return;
            }

            // Validar que hay año académico seleccionado, excepto cuando es únicamente USER
            const isOnlyUser = selectedRecipientTypes.size === 1 && selectedRecipientTypes.has('USER');
            if (!isOnlyUser && selectedAcademicYears.size === 0) {
                setRecipientsError("Debe seleccionar al menos un año académico");
                return;
            }

            setRecipientsLoading(true);
            const personTypes = Array.from(selectedRecipientTypes) as PersonType[];
            
            // Construir filtros académicos
            const academicFilters = {
                academic_years: selectedAcademicYears.size > 0 ? Array.from(selectedAcademicYears) : undefined,
                academic_stages: selectedAcademicStages.size > 0 ? Array.from(selectedAcademicStages) : undefined,
                academic_programs: selectedAcademicPrograms.size > 0 ? Array.from(selectedAcademicPrograms) : undefined,
                program_years: selectedProgramYears.size > 0 ? Array.from(selectedProgramYears) : undefined,
                academic_groups: selectedAcademicGroups.size > 0 ? Array.from(selectedAcademicGroups) : undefined,
            };
            
            const recipientsData = await getRecipientsWithEnrollmentFilters(personTypes, academicFilters);
            setRecipients(recipientsData);
        } catch (err: any) {
            console.error("Error loading recipients:", err);
            setRecipientsError(err.message || "Error al cargar destinatarios");
            setRecipients([]);
        } finally {
            setRecipientsLoading(false);
        }
    };

    // Resetear recipients cuando cambian los tipos de destinatarios
    useEffect(() => {
        setRecipients([]);
        setSelectedRecipients(new Set());
        setRecipientsError(null);
    }, [selectedRecipientTypes, selectedAcademicYears, selectedAcademicStages, selectedAcademicPrograms, selectedProgramYears, selectedAcademicGroups]);

    const handleAcademicYearToggle = (yearId: number, isSelected: boolean) => {
        setSelectedAcademicYears(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(yearId);
            } else {
                newSet.delete(yearId);
            }
            return newSet;
        });
    };

    const handleSelectAllAcademicYears = (isSelected: boolean) => {
        if (isSelected) {
            const allIds = new Set(academicYears.map(year => year.id));
            setSelectedAcademicYears(allIds);
        } else {
            setSelectedAcademicYears(new Set());
        }
    };

    const handleAcademicStageToggle = (stageId: number, isSelected: boolean) => {
        setSelectedAcademicStages(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(stageId);
            } else {
                newSet.delete(stageId);
            }
            return newSet;
        });
    };

    const handleSelectAllAcademicStages = (isSelected: boolean) => {
        if (isSelected) {
            const allIds = new Set(academicStages.map(stage => stage.id));
            setSelectedAcademicStages(allIds);
        } else {
            setSelectedAcademicStages(new Set());
        }
    };

    const handleAcademicProgramToggle = (programId: number, isSelected: boolean) => {
        setSelectedAcademicPrograms(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(programId);
            } else {
                newSet.delete(programId);
            }
            return newSet;
        });
    };

    const handleSelectAllAcademicPrograms = (isSelected: boolean) => {
        if (isSelected) {
            const allIds = new Set(academicPrograms.map(program => program.id));
            setSelectedAcademicPrograms(allIds);
        } else {
            setSelectedAcademicPrograms(new Set());
        }
    };

    const handleProgramYearToggle = (yearId: number, isSelected: boolean) => {
        setSelectedProgramYears(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(yearId);
            } else {
                newSet.delete(yearId);
            }
            return newSet;
        });
    };

    const handleSelectAllProgramYears = (isSelected: boolean) => {
        if (isSelected) {
            const allIds = new Set(programYears.map(year => year.id));
            setSelectedProgramYears(allIds);
        } else {
            setSelectedProgramYears(new Set());
        }
    };

    const handleAcademicGroupToggle = (groupId: number, isSelected: boolean) => {
        setSelectedAcademicGroups(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(groupId);
            } else {
                newSet.delete(groupId);
            }
            return newSet;
        });
    };

    const handleSelectAllAcademicGroups = (isSelected: boolean) => {
        if (isSelected) {
            const allIds = new Set(academicGroups.map(group => group.id));
            setSelectedAcademicGroups(allIds);
        } else {
            setSelectedAcademicGroups(new Set());
        }
    };

    const handleRecipientTypeToggle = (type: string, isSelected: boolean) => {
        setSelectedRecipientTypes(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(type);
            } else {
                newSet.delete(type);
            }
            return newSet;
        });
    };

    const handleSelectAllRecipientTypes = (isSelected: boolean) => {
        if (isSelected) {
            setSelectedRecipientTypes(new Set(['STUDENT', 'TEACHER', 'USER', 'RELATIVE']));
        } else {
            setSelectedRecipientTypes(new Set());
        }
    };

    const handleRecipientToggle = (personId: number, isSelected: boolean) => {
        setSelectedRecipients(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(personId);
            } else {
                newSet.delete(personId);
            }
            return newSet;
        });
    };

    const handleSelectAllRecipients = (isSelected: boolean) => {
        if (isSelected) {
            const allIds = new Set(recipients.map(recipient => recipient.person_id));
            setSelectedRecipients(allIds);
        } else {
            setSelectedRecipients(new Set());
        }
    };

    const handlePublishAnnouncement = async () => {
        try {
            setPublishLoading(true);
            setPublishError(null);

            // Validations
            if (!announcementTitle.trim()) {
                setPublishError("El título es requerido");
                return;
            }

            if (!announcementContent.trim()) {
                setPublishError("El contenido es requerido");
                return;
            }

            if (!startDate) {
                setPublishError("La fecha de inicio es requerida");
                return;
            }

            if (!endDate) {
                setPublishError("La fecha de fin es requerida");
                return;
            }

            // Validaciones adicionales para tareas
            if (publicationType === 'assignment') {
                if (!subjectId.trim()) {
                    setPublishError("El ID de la materia es requerido para tareas");
                    return;
                }
                if (!subjectName.trim()) {
                    setPublishError("El nombre de la materia es requerido para tareas");
                    return;
                }
                if (!dueDate) {
                    setPublishError("La fecha de entrega es requerida para tareas");
                    return;
                }
            }

            // Validar destinatarios solo en modo creación
            if (!announcementId && selectedRecipients.size === 0) {
                setPublishError("Debe seleccionar al menos un destinatario");
                return;
            }

            if (!personId) {
                setPublishError("No se pudo obtener la información del usuario");
                return;
            }

            // Prepare data for API
            const schoolId = process.env.NEXT_PUBLIC_SCHOOL_ID || "1000";

            // Convert selected recipients to string array
            const personsArray = Array.from(selectedRecipients).map(id => id.toString());

            // Convert selected IDs to string arrays
            const academicYearsArray = Array.from(selectedAcademicYears).map(id => id.toString());
            const academicStagesArray = Array.from(selectedAcademicStages).map(id => id.toString());
            const academicProgramsArray = Array.from(selectedAcademicPrograms).map(id => id.toString());
            const programYearsArray = Array.from(selectedProgramYears).map(id => id.toString());
            const academicGroupsArray = Array.from(selectedAcademicGroups).map(id => id.toString());

            // Upload attachments if any
            const uploadedAttachments: IAttachmentCreate[] = [];
            if (attachments.length > 0) {
                for (const file of attachments) {
                    try {
                        const uploadResult = await communicationService.uploadAttachment(schoolId, file);
                        // Send the complete upload response
                        uploadedAttachments.push(uploadResult);
                    } catch (uploadError) {
                        console.error('Error uploading attachment:', file.name, uploadError);
                        throw new Error(`Error al subir el archivo ${file.name}`);
                    }
                }
            }

            const baseData = {
                publisher_person_id: personId.toString(),
                title: announcementTitle.trim(),
                content: announcementContent.trim(),
                start_date: new Date(startDate).toISOString(),
                end_date: new Date(endDate).toISOString(),
                accept_comments: acceptComments,
                authorized: authorized,
                status: "ACTIVE",
                persons: personsArray,
                ...(academicYearsArray.length > 0 && { academic_years: academicYearsArray }),
                ...(academicStagesArray.length > 0 && { academic_stages: academicStagesArray }),
                ...(academicProgramsArray.length > 0 && { academic_programs: academicProgramsArray }),
                ...(programYearsArray.length > 0 && { academic_program_years: programYearsArray }),
                ...(academicGroupsArray.length > 0 && { academic_groups: academicGroupsArray }),
                attachments: uploadedAttachments
            };

            // Agregar campos adicionales para tareas
            const announcementData: IAnnouncementCreate = publicationType === 'assignment'
                ? {
                    ...baseData,
                    subject_id: subjectId.trim(),
                    subject_name: subjectName.trim(),
                    due_date: new Date(dueDate).toISOString()
                }
                : baseData;

            // Create or update announcement
            let result;
            if (announcementId) {
                // Combinar attachments existentes con los nuevos
                const allAttachments = [
                    ...existingAttachments, // Ya tienen la estructura correcta
                    ...uploadedAttachments
                ];

                // Preparar DTO de actualización
                const updateDto: any = {
                    title: announcementTitle.trim(),
                    content: announcementContent.trim(),
                    start_date: new Date(startDate).toISOString(),
                    end_date: new Date(endDate).toISOString(),
                    accept_comments: acceptComments,
                    authorized: authorized,
                    attachments: allAttachments, // Siempre enviar, incluso si está vacío
                };

                // Agregar campos de assignment si es una tarea
                if (publicationType === 'assignment') {
                    updateDto.subject_id = subjectId.trim();
                    updateDto.subject_name = subjectName.trim();
                    updateDto.due_date = new Date(dueDate).toISOString();
                }

                // Update existing publication (announcement or assignment)
                if (publicationType === 'assignment') {
                    result = await assignmentService.update({
                        schoolId,
                        assignmentId: announcementId,
                        dto: updateDto
                    });
                } else {
                    result = await update({
                        schoolId,
                        announcementId,
                        dto: updateDto
                    });
                }

                console.log(`${publicationType === 'assignment' ? 'Tarea' : 'Aviso'} actualizado exitosamente:`, result);
                alert(`¡${publicationType === 'assignment' ? 'Tarea actualizada' : 'Aviso actualizado'} exitosamente!`);
            } else {
                // Create new announcement or assignment
                if (publicationType === 'assignment') {
                    // Create assignment using assignment service
                    result = await assignmentService.create({
                        schoolId,
                        dto: announcementData
                    });
                } else {
                    // Create announcement
                    result = await create({
                        schoolId,
                        dto: announcementData
                    });
                }

                // Reset form on success
                setAnnouncementTitle('');
                setAnnouncementContent('');
                setStartDate('');
                setEndDate('');
                setAcceptComments(true);
                setAuthorized(true);
                setAttachments([]);
                setSubjectId('');
                setSubjectName('');
                setDueDate('');

                console.log(`${publicationType === 'assignment' ? 'Tarea' : 'Aviso'} publicado exitosamente:`, result);
                alert(`¡${publicationType === 'assignment' ? 'Tarea publicada' : 'Aviso publicado'} exitosamente!`);
            }

        } catch (err: any) {
            console.error("Error publishing:", err);
            const errorMessage = err.response?.data?.message || err.message ||
                `Error al publicar ${publicationType === 'assignment' ? 'la tarea' : 'el aviso'}`;
            setPublishError(errorMessage);
        } finally {
            setPublishLoading(false);
        }
    };

    return (
        <div className="bg-base-100 rounded-lg shadow-sm">
            <div className="p-6 border-b border-base-300">
                <h2 className="text-2xl font-bold text-base-content">
                    Centro de Publicaciones
                </h2>
                <p className="text-base-content/70 mt-2">
                    Crear y gestionar avisos para los años académicos seleccionados
                </p>
            </div>

            <div className="p-6">
                <div className="space-y-6">
                    {/* Selección de tipo de publicación - Solo mostrar si NO estamos en modo edición */}
                    {!announcementId && (
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
                                        publicationType === 'announcement'
                                            ? 'border-primary bg-primary/10'
                                            : 'border-base-300 hover:border-base-400'
                                    }`}
                                    onClick={() => setPublicationType('announcement')}
                                >
                                    <div className="card-body">
                                        <div className="flex items-center gap-4">
                                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                                                publicationType === 'announcement' ? 'bg-primary text-primary-content' : 'bg-base-200'
                                            }`}>
                                                <span className="iconify lucide--megaphone size-6"></span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-base">Aviso</h4>
                                                <p className="text-sm text-base-content/70">
                                                    Publicar información general para la comunidad educativa
                                                </p>
                                            </div>
                                            {publicationType === 'announcement' && (
                                                <span className="iconify lucide--check-circle size-6 text-primary"></span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Opción Tarea */}
                                <div
                                    className={`card border-2 cursor-pointer transition-all duration-200 ${
                                        publicationType === 'assignment'
                                            ? 'border-secondary bg-secondary/10'
                                            : 'border-base-300 hover:border-base-400'
                                    }`}
                                    onClick={() => setPublicationType('assignment')}
                                >
                                    <div className="card-body">
                                        <div className="flex items-center gap-4">
                                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                                                publicationType === 'assignment' ? 'bg-secondary text-secondary-content' : 'bg-base-200'
                                            }`}>
                                                <span className="iconify lucide--clipboard-list size-6"></span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-base">Tarea</h4>
                                                <p className="text-sm text-base-content/70">
                                                    Asignar tareas y actividades con fecha de entrega
                                                </p>
                                            </div>
                                            {publicationType === 'assignment' && (
                                                <span className="iconify lucide--check-circle size-6 text-secondary"></span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    )}

                    {/* Selección de tipos de destinatarios - Solo mostrar si NO estamos en modo edición */}
                    {!announcementId && (
                    <div className="card card-border bg-base-100 shadow-lg">
                        <div className="card-body">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="card-title text-lg">
                                    <span className="iconify lucide--users-2 size-5"></span>
                                    Selecciona Tipo Destinatarios
                                </h3>
                                <div className="text-sm text-base-content/70">
                                    {selectedRecipientTypes.size} de 4 seleccionados
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Checkbox para seleccionar todos */}
                                <div className="flex items-center gap-3 p-3 border border-base-300 rounded-lg bg-base-200">
                                    <label className="label cursor-pointer flex items-center gap-3 p-0">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-primary"
                                            checked={selectedRecipientTypes.size === 4}
                                            onChange={(e) => handleSelectAllRecipientTypes(e.target.checked)}
                                        />
                                        <span className="font-medium text-base-content">
                                            Seleccionar todos los tipos de destinatarios
                                        </span>
                                    </label>
                                </div>

                                {/* Lista de tipos de destinatarios */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {[
                                        { value: 'STUDENT', label: 'Estudiantes', icon: 'lucide--graduation-cap', color: 'primary' },
                                        { value: 'RELATIVE', label: 'Familiares', icon: 'lucide--heart', color: 'success' },
                                        { value: 'TEACHER', label: 'Profesores', icon: 'lucide--user-check', color: 'secondary' },
                                        { value: 'USER', label: 'Usuarios', icon: 'lucide--users', color: 'accent' }
                                    ].map((recipientType) => (
                                        <div 
                                            key={recipientType.value}
                                            className={`card border transition-all duration-200 ${
                                                selectedRecipientTypes.has(recipientType.value) 
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
                                                            checked={selectedRecipientTypes.has(recipientType.value)}
                                                            onChange={(e) => handleRecipientTypeToggle(recipientType.value, e.target.checked)}
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
                    )}

                    {/* Información de filtros académicos en modo edición */}
                    {announcementId && loadedAnnouncement && (
                        <DestinatariosInfo
                            announcement={loadedAnnouncement}
                            academicYears={academicYears}
                            academicStages={academicStages}
                            academicPrograms={academicPrograms}
                            programYears={programYears}
                            academicGroups={academicGroups}
                        />
                    )}

                    {/* Selección de años académicos - Solo mostrar si no es únicamente USER y NO estamos en modo edición */}
                    {!announcementId && !(selectedRecipientTypes.size === 1 && selectedRecipientTypes.has('USER')) && (
                        <div className="card bg-base-100 shadow-lg">
                        <div className="card-body">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="card-title text-lg">
                                    <span className="iconify lucide--calendar size-5"></span>
                                    Años Académicos
                                </h3>
                                <div className="text-sm text-base-content/70">
                                    {selectedAcademicYears.size} de {academicYears.length} seleccionados
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <LoadingSpinner message="Cargando años académicos..." />
                                </div>
                            ) : error ? (
                                <div className="alert alert-error shadow-lg">
                                    <span className="iconify lucide--alert-circle size-6"></span>
                                    <div>
                                        <h3 className="font-bold">Error</h3>
                                        <div className="text-sm">{error}</div>
                                    </div>
                                </div>
                            ) : academicYears.length === 0 ? (
                                <div className="text-center py-8">
                                    <span className="iconify lucide--calendar-x size-16 text-base-content/30 mb-4"></span>
                                    <p className="text-base-content/70">
                                        No se encontraron años académicos activos
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
                                                checked={academicYears.length > 0 && selectedAcademicYears.size === academicYears.length}
                                                onChange={(e) => handleSelectAllAcademicYears(e.target.checked)}
                                                
                                            />
                                            <span className="font-medium text-base-content">
                                                Seleccionar todos los años académicos
                                            </span>
                                        </label>
                                    </div>

                                    {/* Lista de años académicos */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                        {academicYears.map((year) => (
                                            <div 
                                                key={year.id}
                                                className={`card border transition-all duration-200 ${
                                                    selectedAcademicYears.has(year.id) 
                                                        ? 'border-primary bg-primary/5' 
                                                        : 'border-base-300 hover:border-base-400'
                                                }`}
                                            >
                                                <div className="card-body p-2">
                                                    <label className="label cursor-pointer p-0 justify-start">
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox checkbox-primary checkbox-sm mr-2"
                                                            checked={selectedAcademicYears.has(year.id)}
                                                            onChange={(e) => handleAcademicYearToggle(year.id, e.target.checked)}
                                                            
                                                        />
                                                        <div className="flex-1">
                                                            <div className="text-xs text-base-content">
                                                                {year.academic_year_key}
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
                    )}

                    {/* Todas las secciones académicas - Solo mostrar si no es únicamente USER */}
                    {!(selectedRecipientTypes.size === 1 && selectedRecipientTypes.has('USER')) && (
                    <>
                    {/* Selección de niveles académicos - Solo mostrar si NO estamos en modo edición */}
                    {!announcementId && (
                    <div className="card bg-base-100 shadow-lg">
                        <div className="card-body">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="card-title text-lg">
                                    <span className="iconify lucide--graduation-cap size-5"></span>
                                    Niveles Académicos
                                </h3>
                                <div className="text-sm text-base-content/70">
                                    {selectedAcademicStages.size} de {academicStages.length} seleccionados
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <LoadingSpinner message="Cargando niveles académicos..." />
                                </div>
                            ) : error ? (
                                <div className="alert alert-error shadow-lg">
                                    <span className="iconify lucide--alert-circle size-6"></span>
                                    <div>
                                        <h3 className="font-bold">Error</h3>
                                        <div className="text-sm">{error}</div>
                                    </div>
                                </div>
                            ) : academicStages.length === 0 ? (
                                <div className="text-center py-8">
                                    <span className="iconify lucide--graduation-cap size-16 text-base-content/30 mb-4"></span>
                                    <p className="text-base-content/70">
                                        No se encontraron niveles académicos activos
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
                                                checked={academicStages.length > 0 && selectedAcademicStages.size === academicStages.length}
                                                onChange={(e) => handleSelectAllAcademicStages(e.target.checked)}
                                                
                                            />
                                            <span className="font-medium text-base-content">
                                                Seleccionar todos los niveles académicos
                                            </span>
                                        </label>
                                    </div>

                                    {/* Lista de niveles académicos */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                        {academicStages.map((stage) => (
                                            <div 
                                                key={stage.id}
                                                className={`card border transition-all duration-200 ${
                                                    selectedAcademicStages.has(stage.id) 
                                                        ? 'border-primary bg-primary/5' 
                                                        : 'border-base-300 hover:border-base-400'
                                                }`}
                                            >
                                                <div className="card-body p-2">
                                                    <label className="label cursor-pointer p-0 justify-start">
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox checkbox-primary checkbox-sm mr-2"
                                                            checked={selectedAcademicStages.has(stage.id)}
                                                            onChange={(e) => handleAcademicStageToggle(stage.id, e.target.checked)}
                                                            
                                                        />
                                                        <div className="flex-1">
                                                            <div className="text-xs text-base-content">
                                                                ({stage.academic_stage_key}) {stage.description}
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
                    )}

                    {/* Selección de programas académicos (solo si hay stages seleccionados) - Solo mostrar si NO estamos en modo edición */}
                    {!announcementId && selectedAcademicStages.size > 0 && (
                        <div className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="card-title text-lg">
                                        <span className="iconify lucide--book-open size-5"></span>
                                        Programas Académicos
                                    </h3>
                                    <div className="text-sm text-base-content/70">
                                        {selectedAcademicPrograms.size} de {academicPrograms.length} seleccionados
                                    </div>
                                </div>

                                {academicPrograms.length === 0 ? (
                                    <div className="text-center py-8">
                                        <span className="iconify lucide--book-open size-16 text-base-content/30 mb-4"></span>
                                        <p className="text-base-content/70">
                                            No se encontraron programas académicos para los niveles seleccionados
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
                                                    checked={academicPrograms.length > 0 && selectedAcademicPrograms.size === academicPrograms.length}
                                                    onChange={(e) => handleSelectAllAcademicPrograms(e.target.checked)}
                                                    
                                                />
                                                <span className="font-medium text-base-content">
                                                    Seleccionar todos los programas académicos
                                                </span>
                                            </label>
                                        </div>

                                        {/* Lista de programas académicos */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                            {academicPrograms.map((program) => (
                                                <div 
                                                    key={program.id}
                                                    className={`card border transition-all duration-200 ${
                                                        selectedAcademicPrograms.has(program.id) 
                                                            ? 'border-primary bg-primary/5' 
                                                            : 'border-base-300 hover:border-base-400'
                                                    }`}
                                                >
                                                    <div className="card-body p-2">
                                                        <label className="label cursor-pointer p-0 justify-start">
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox checkbox-primary checkbox-sm mr-2"
                                                                checked={selectedAcademicPrograms.has(program.id)}
                                                                onChange={(e) => handleAcademicProgramToggle(program.id, e.target.checked)}
                                                                
                                                            />
                                                            <div className="flex-1">
                                                                <div className="text-xs text-base-content">
                                                                    ({program.academic_program_key}) {program.description}
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
                    )}

                    {/* Selección de años de programa (solo si hay stages y programs seleccionados) - Solo mostrar si NO estamos en modo edición */}
                    {!announcementId && selectedAcademicStages.size > 0 && selectedAcademicPrograms.size > 0 && (
                        <div className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="card-title text-lg">
                                        <span className="iconify lucide--layers size-5"></span>
                                        Años de Programa
                                    </h3>
                                    <div className="text-sm text-base-content/70">
                                        {selectedProgramYears.size} de {programYears.length} seleccionados
                                    </div>
                                </div>

                                {programYears.length === 0 ? (
                                    <div className="text-center py-8">
                                        <span className="iconify lucide--layers size-16 text-base-content/30 mb-4"></span>
                                        <p className="text-base-content/70">
                                            No se encontraron años de programa para la combinación seleccionada
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
                                                    checked={programYears.length > 0 && selectedProgramYears.size === programYears.length}
                                                    onChange={(e) => handleSelectAllProgramYears(e.target.checked)}
                                                    
                                                />
                                                <span className="font-medium text-base-content">
                                                    Seleccionar todos los años de programa
                                                </span>
                                            </label>
                                        </div>

                                        {/* Lista de años de programa */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                            {programYears.map((year) => (
                                                <div 
                                                    key={year.id}
                                                    className={`card border transition-all duration-200 ${
                                                        selectedProgramYears.has(year.id) 
                                                            ? 'border-primary bg-primary/5' 
                                                            : 'border-base-300 hover:border-base-400'
                                                    }`}
                                                >
                                                    <div className="card-body p-2">
                                                        <label className="label cursor-pointer p-0 justify-start">
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox checkbox-primary checkbox-sm mr-2"
                                                                checked={selectedProgramYears.has(year.id)}
                                                                onChange={(e) => handleProgramYearToggle(year.id, e.target.checked)}
                                                                
                                                            />
                                                            <div className="flex-1">
                                                                <div className="text-xs text-base-content">
                                                                    {year.description}
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
                    )}

                    {/* Selección de grupos académicos (solo si hay program years seleccionados) - Solo mostrar si NO estamos en modo edición */}
                    {!announcementId && selectedProgramYears.size > 0 && (
                        <div className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="card-title text-lg">
                                        <span className="iconify lucide--users size-5"></span>
                                        Grupos Académicos
                                    </h3>
                                    <div className="text-sm text-base-content/70">
                                        {selectedAcademicGroups.size} de {academicGroups.length} seleccionados
                                    </div>
                                </div>

                                {academicGroups.length === 0 ? (
                                    <div className="text-center py-8">
                                        <span className="iconify lucide--users size-16 text-base-content/30 mb-4"></span>
                                        <p className="text-base-content/70">
                                            No se encontraron grupos académicos para los años de programa seleccionados
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
                                                    checked={academicGroups.length > 0 && selectedAcademicGroups.size === academicGroups.length}
                                                    onChange={(e) => handleSelectAllAcademicGroups(e.target.checked)}
                                                    
                                                />
                                                <span className="font-medium text-base-content">
                                                    Seleccionar todos los grupos académicos
                                                </span>
                                            </label>
                                        </div>

                                        {/* Lista de grupos académicos */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                            {academicGroups.map((group) => (
                                                <div 
                                                    key={group.id}
                                                    className={`card border transition-all duration-200 ${
                                                        selectedAcademicGroups.has(group.id) 
                                                            ? 'border-primary bg-primary/5' 
                                                            : 'border-base-300 hover:border-base-400'
                                                    }`}
                                                >
                                                    <div className="card-body p-2">
                                                        <label className="label cursor-pointer p-0 justify-start">
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox checkbox-primary checkbox-sm mr-2"
                                                                checked={selectedAcademicGroups.has(group.id)}
                                                                onChange={(e) => handleAcademicGroupToggle(group.id, e.target.checked)}
                                                                
                                                            />
                                                            <div className="flex-1">
                                                                <div className="text-xs text-base-content">
                                                                    {group.label}
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
                    )}
                    </>
                    )}

                    {/* Sección de Recipients (solo si hay tipos de destinatarios seleccionados) */}
                    {selectedRecipientTypes.size > 0 && (
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
                                            onClick={loadRecipients}
                                            disabled={recipientsLoading || selectedRecipientTypes.size === 0}
                                        >
                                            {recipientsLoading ? (
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
                                            {selectedRecipients.size} de {recipients.length} seleccionados
                                        </div>
                                    </div>
                                </div>

                                {/* Mensaje de error */}
                                {recipientsError && (
                                    <div className="alert alert-error shadow-lg mt-4">
                                        <span className="iconify lucide--alert-circle size-6"></span>
                                        <div>
                                            <h3 className="font-bold">Error de validación</h3>
                                            <div className="text-sm">{recipientsError}</div>
                                        </div>
                                    </div>
                                )}

                                {recipientsLoading ? (
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
                                                    checked={recipients.length > 0 && selectedRecipients.size === recipients.length}
                                                    onChange={(e) => handleSelectAllRecipients(e.target.checked)}
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
                                                                checked={recipients.length > 0 && selectedRecipients.size === recipients.length}
                                                                onChange={(e) => handleSelectAllRecipients(e.target.checked)}
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
                                                    {recipients.map((recipient) => (
                                                        <tr 
                                                            key={recipient.person_id}
                                                            className={`hover:bg-base-200 cursor-pointer ${
                                                                selectedRecipients.has(recipient.person_id) 
                                                                    ? 'bg-primary/5 border-primary/20' 
                                                                    : ''
                                                            }`}
                                                            onClick={() => handleRecipientToggle(
                                                                recipient.person_id, 
                                                                !selectedRecipients.has(recipient.person_id)
                                                            )}
                                                        >
                                                            <td>
                                                                <input
                                                                    type="checkbox"
                                                                    className="checkbox checkbox-primary checkbox-sm"
                                                                    checked={selectedRecipients.has(recipient.person_id)}
                                                                    onChange={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRecipientToggle(recipient.person_id, e.target.checked);
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
                                                                <div className={`badge badge-sm ${
                                                                    recipient.person_type === 'STUDENT' ? 'badge-primary' :
                                                                    recipient.person_type === 'TEACHER' ? 'badge-secondary' :
                                                                    recipient.person_type === 'USER' ? 'badge-accent' :
                                                                    'badge-success'
                                                                }`}>
                                                                    {recipient.person_type === 'STUDENT' ? 'Estudiante' :
                                                                     recipient.person_type === 'TEACHER' ? 'Profesor' :
                                                                     recipient.person_type === 'USER' ? 'Usuario' :
                                                                     'Familiar'}
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
                                                    ))}
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
                    )}

                    {/* Formulario para crear aviso (aparece cuando se seleccionan años académicos o solo USER) */}
                    {(selectedAcademicYears.size > 0 || selectedAcademicStages.size > 0 || (selectedRecipientTypes.size === 1 && selectedRecipientTypes.has('USER'))) && (
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
                                                value={announcementTitle}
                                                onChange={(e) => setAnnouncementTitle(e.target.value)}
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
                                                        value={subjectId}
                                                        onChange={(e) => setSubjectId(e.target.value)}
                                                    />
                                                </label>
                                                <p className="fieldset-label">ID de la materia</p>
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
                                                        value={subjectName}
                                                        onChange={(e) => setSubjectName(e.target.value)}
                                                    />
                                                </label>
                                                <p className="fieldset-label">Nombre de la materia</p>
                                            </fieldset>

                                            <fieldset className="fieldset">
                                                <legend className="fieldset-legend flex items-center gap-2">
                                                    <span className="iconify lucide--calendar-clock size-4"></span>
                                                    Fecha de entrega
                                                </legend>
                                                <label className="input input-secondary">
                                                    <span className="iconify lucide--calendar-days text-base-content/60 size-5"></span>
                                                    <input
                                                        className="grow"
                                                        type="date"
                                                        value={dueDate}
                                                        onChange={(e) => setDueDate(e.target.value)}
                                                    />
                                                </label>
                                                <p className="fieldset-label">Fecha límite de entrega</p>
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
                                                    menubar: false,
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
                                                    // Configuración para subida de imágenes
                                                    images_upload_handler: (blobInfo: any, progress: any) => new Promise(async (resolve, reject) => {
                                                        console.log('TinyMCE images_upload_handler called', blobInfo);
                                                        try {
                                                            const file = blobInfo.blob();
                                                            console.log('File to upload:', file.name, file.type, file.size);
                                                            const fileUrl = await handleFileUpload(file);
                                                            console.log('Resolving with URL:', fileUrl);
                                                            resolve(fileUrl);
                                                        } catch (error) {
                                                            console.error('Error uploading image:', error);
                                                            reject(error);
                                                        }
                                                    }),
                                                    // Permitir pegar imágenes
                                                    paste_data_images: true,
                                                    // Subidas automáticas
                                                    automatic_uploads: true,
                                                    // Configuración adicional para uploads
                                                    images_upload_url: '/api/upload', // URL ficticia, usaremos el handler
                                                    images_reuse_filename: true,
                                                    // Mostrar el diálogo de subida de archivos
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
                                                                        const fileUrl = await handleFileUpload(file);
                                                                        callback(fileUrl, {
                                                                            alt: file.name
                                                                        });
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
                                                value={announcementContent}
                                                onEditorChange={(content) => setAnnouncementContent(content)}
                                            />
                                        </div>
                                        <p className="fieldset-label">Usa las herramientas del editor para dar formato a tu {publicationType === 'assignment' ? 'tarea' : 'aviso'}</p>
                                    </fieldset>

                                    {/* Fechas */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend flex items-center gap-2">
                                                <span className="iconify lucide--calendar size-4"></span>
                                                Fecha de Inicio
                                            </legend>
                                            <label className="input input-success">
                                                <span className="iconify lucide--calendar-days text-base-content/60 size-5"></span>
                                                <input
                                                    className="grow"
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                />
                                            </label>
                                            <p className="fieldset-label">Cuándo inicia la vigencia</p>
                                        </fieldset>

                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend flex items-center gap-2">
                                                <span className="iconify lucide--calendar-x size-4"></span>
                                                Fecha de Fin
                                            </legend>
                                            <label className="input input-warning">
                                                <span className="iconify lucide--calendar-clock text-base-content/60 size-5"></span>
                                                <input
                                                    className="grow"
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                />
                                            </label>
                                            <p className="fieldset-label">Cuándo expira {publicationType === 'assignment' ? 'la tarea' : 'el aviso'}</p>
                                        </fieldset>
                                    </div>

                                    {/* Archivos Adjuntos */}
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
                                                    files.forEach(file => handleAddAttachment(file));
                                                }}
                                                onDragOver={(e) => e.preventDefault()}
                                                onClick={() => {
                                                    const input = document.createElement('input');
                                                    input.type = 'file';
                                                    input.multiple = true;
                                                    input.accept = '*/*';
                                                    input.onchange = (e: any) => {
                                                        const files = Array.from(e.target.files);
                                                        files.forEach((file: any) => handleAddAttachment(file));
                                                    };
                                                    input.click();
                                                }}
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
                                                                        onClick={() => handleRemoveExistingAttachment(index)}
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
                                                                    onClick={() => handleRemoveAttachment(index)}
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
                                                        checked={acceptComments}
                                                        onChange={(e) => setAcceptComments(e.target.checked)}
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
                                                        checked={authorized}
                                                        onChange={(e) => setAuthorized(e.target.checked)}
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
                                        onClick={handlePublishAnnouncement}
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
                    )}

                    {/* Mensaje cuando no hay elementos seleccionados - Solo mostrar si no es únicamente USER */}
                    {!loading && !error && academicYears.length > 0 && selectedAcademicYears.size === 0 && selectedAcademicStages.size === 0 && !(selectedRecipientTypes.size === 1 && selectedRecipientTypes.has('USER')) && (
                        <div className="text-center py-12">
                            <span className="iconify lucide--check-square size-16 text-base-content/30 mb-4"></span>
                            <h3 className="text-lg font-medium text-base-content mb-2">
                                Selecciona años y niveles académicos
                            </h3>
                            <p className="text-base-content/70">
                                Para crear un aviso, selecciona uno o más años académicos y niveles académicos
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicationsApp;