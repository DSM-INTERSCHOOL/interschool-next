import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IAnnouncementRead, IAttachmentRead, IAttachmentCreate } from "@/interfaces/IAnnouncement";
import { getById, create, update } from "@/services/announcement.service";
import * as assignmentService from "@/services/assignment.service";
import * as eventService from "@/services/event.service";
import { communicationService } from "@/services/communication.service";
import { getOrgConfig } from "@/lib/orgConfig";
import { useAuthStore } from "@/store/useAuthStore";
import { PublicationType } from "@/app/(admin)/apps/publications/components/PublicationTypeSelector";

const computeEventEndTime = (startStr: string, duration: string): Date => {
    const start = new Date(startStr);
    if (duration === 'allday') {
        const end = new Date(start);
        end.setHours(23, 59, 59, 0);
        return end;
    }
    return new Date(start.getTime() + parseInt(duration, 10) * 60000);
};

const toLocalInput = (date: Date): string =>
    new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

interface PublicationFormData {
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

export const usePublicationForm = (
    announcementId?: string,
    publicationType: PublicationType = 'announcement'
) => {
    const router = useRouter();
    const { personId } = useAuthStore();

    const [formData, setFormData] = useState<PublicationFormData>({
        title: '',
        content: '',
        startDate: '',
        endDate: '',
        acceptComments: false,
        authorized: true,
        subjectId: '',
        subjectName: '',
        dueDate: '',
        requiresConfirmation: false,
        requiresSignature: false,
        signatureType: 'PASSWORD',
        confirmationLegend: '',
        signatureLegend: '',
        eventStartTime: '',
        eventDuration: '60',
        confirmationDeadline: '',
        eventLocation: '',
        eventUrl: '',
        mapUrl: '',
        optionList1: [],
        optionList2: [],
        labelOption1: '',
        labelOption2: '',
    });

    // Initialize startDate to now for new events
    useEffect(() => {
        if (publicationType === 'event' && !announcementId) {
            const now = new Date();
            const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16);
            setFormData(prev => ({ ...prev, startDate: local }));
        }
    }, [publicationType, announcementId]);

    // Auto-compute confirmationDeadline = event_end_time - 1 day
    useEffect(() => {
        if (publicationType !== 'event' || !formData.eventStartTime) return;
        const end = computeEventEndTime(formData.eventStartTime, formData.eventDuration);
        const deadline = new Date(end);
        deadline.setDate(deadline.getDate() - 1);
        setFormData(prev => ({ ...prev, confirmationDeadline: toLocalInput(deadline) }));
    }, [formData.eventStartTime, formData.eventDuration]);

    const [attachments, setAttachments] = useState<File[]>([]);
    const [existingAttachments, setExistingAttachments] = useState<IAttachmentRead[]>([]);
    const [loadedAnnouncement, setLoadedAnnouncement] = useState<IAnnouncementRead | null>(null);
    const [loading, setLoading] = useState(false);
    const [publishLoading, setPublishLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [publishError, setPublishError] = useState<string | null>(null);

    // Cargar publicación existente
    useEffect(() => {
        const loadPublication = async () => {
            if (!announcementId) return;

            try {
                setLoading(true);
                const { schoolId } = getOrgConfig();
                let publication;

                if (publicationType === 'assignment') {
                    publication = await assignmentService.getById({ schoolId, assignmentId: announcementId });
                } else if (publicationType === 'event') {
                    publication = await eventService.getById({ schoolId, eventId: announcementId });
                } else {
                    publication = await getById({ schoolId, announcementId });
                }

                setLoadedAnnouncement(publication);

                // Función helper para convertir UTC a hora local
                const toLocalDateTimeString = (utcDate: string) => {
                    const date = new Date(utcDate);
                    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                        .toISOString()
                        .slice(0, 16);
                };

                setFormData({
                    title: publication.title || '',
                    content: publication.content || '',
                    startDate: publication.start_date ? toLocalDateTimeString(publication.start_date) : '',
                    endDate: publication.end_date ? toLocalDateTimeString(publication.end_date) : '',
                    acceptComments: publication.accept_comments ?? true,
                    authorized: publication.authorized ?? true,
                    subjectId: (publication as any).subject_id || '',
                    subjectName: (publication as any).subject_name || '',
                    dueDate: (publication as any).due_date ? toLocalDateTimeString((publication as any).due_date) : '',
                    requiresConfirmation: (publication as any).requires_confirmation ?? false,
                    requiresSignature: (publication as any).requires_signature ?? false,
                    signatureType: (publication as any).signature_type || 'PASSWORD',
                    confirmationLegend: (publication as any).confirmation_legend || '',
                    signatureLegend: (publication as any).signature_legend || '',
                    eventStartTime: (publication as any).event_start_time ? toLocalDateTimeString((publication as any).event_start_time) : '',
                    confirmationDeadline: (publication as any).confirmation_deadline ? toLocalDateTimeString((publication as any).confirmation_deadline) : '',
                    eventLocation: (publication as any).event_location || '',
                    eventUrl: (publication as any).event_url || '',
                    mapUrl: (publication as any).map_url || '',
                    optionList1: (publication as any).option_list_1 ?? [],
                    optionList2: (publication as any).option_list_2 ?? [],
                    labelOption1: (publication as any).label_option_1 || '',
                    labelOption2: (publication as any).label_option_2 || '',
                    eventDuration: (() => {
                        const s = (publication as any).event_start_time;
                        const e = (publication as any).event_end_time;
                        if (!s || !e) return '60';
                        const diff = Math.round((new Date(e).getTime() - new Date(s).getTime()) / 60000);
                        if (diff > 0 && diff <= 240 && diff % 30 === 0) return diff.toString();
                        return 'allday';
                    })(),
                });

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

    const updateFormField = <K extends keyof PublicationFormData>(
        field: K,
        value: PublicationFormData[K]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addAttachment = (file: File) => {
        setAttachments(prev => [...prev, file]);
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingAttachment = (index: number) => {
        setExistingAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleFileUpload = async (file: File): Promise<string> => {
        try {
            const { schoolId } = getOrgConfig();
            const result = await communicationService.uploadAttachment(schoolId, file);
            return result.public_url;
        } catch (error) {
            console.error("Error uploading file:", error);
            throw new Error("Error al subir el archivo");
        }
    };

    const validateForm = (selectedRecipients: Set<number>) => {
        if (!formData.title.trim()) {
            setPublishError("El título es requerido");
            return false;
        }

        if (!formData.content.trim()) {
            setPublishError("El contenido es requerido");
            return false;
        }

        if (!formData.startDate) {
            setPublishError("La fecha de inicio es requerida");
            return false;
        }

        if (publicationType === 'event') {
            if (!formData.eventStartTime) {
                setPublishError("La hora de inicio del evento es requerida");
                return false;
            }
        } else if (!formData.endDate) {
            setPublishError("La fecha de fin es requerida");
            return false;
        }

        if (publicationType === 'assignment') {
            if (!formData.subjectId.trim()) {
                setPublishError("El ID de la materia es requerido para tareas");
                return false;
            }
            if (!formData.subjectName.trim()) {
                setPublishError("El nombre de la materia es requerido para tareas");
                return false;
            }
            if (!formData.dueDate) {
                setPublishError("La fecha de entrega es requerida para tareas");
                return false;
            }
        }

        if (!announcementId && selectedRecipients.size === 0) {
            setPublishError("Debe seleccionar al menos un destinatario");
            return false;
        }

        if (!personId) {
            setPublishError("No se pudo obtener la información del usuario");
            return false;
        }

        return true;
    };

    const handlePublish = async (
        selectedRecipients: Set<number>,
        academicSelections: {
            academicYears: Set<number>;
            academicStages: Set<number>;
            academicPrograms: Set<number>;
            programYears: Set<number>;
            academicGroups: Set<number>;
        }
    ) => {
        try {
            setPublishLoading(true);
            setPublishError(null);

            if (!validateForm(selectedRecipients)) {
                return;
            }

            const { schoolId } = getOrgConfig();

            // Upload attachments
            const uploadedAttachments: IAttachmentCreate[] = [];
            if (attachments.length > 0) {
                for (const file of attachments) {
                    try {
                        const uploadResult = await communicationService.uploadAttachment(schoolId, file);
                        uploadedAttachments.push(uploadResult);
                    } catch (uploadError) {
                        console.error('Error uploading attachment:', file.name, uploadError);
                        throw new Error(`Error al subir el archivo ${file.name}`);
                    }
                }
            }

            // Convert dates to UTC
            const startDateUTC = new Date(formData.startDate).toISOString();
            const endDateUTC = publicationType === 'event' && formData.eventStartTime
                ? (() => { const d = computeEventEndTime(formData.eventStartTime, formData.eventDuration); d.setDate(d.getDate() + 1); return d.toISOString(); })()
                : new Date(formData.endDate).toISOString();

            const baseData = {
                publisher_person_id: personId!.toString(),
                title: formData.title.trim(),
                content: formData.content.trim(),
                start_date: startDateUTC,
                end_date: endDateUTC,
                accept_comments: formData.acceptComments,
                authorized: formData.authorized,
                status: "ACTIVE",
                persons: Array.from(selectedRecipients).map(id => id.toString()),
                ...(academicSelections.academicYears.size > 0 && {
                    academic_years: Array.from(academicSelections.academicYears).map(id => id.toString())
                }),
                ...(academicSelections.academicStages.size > 0 && {
                    academic_stages: Array.from(academicSelections.academicStages).map(id => id.toString())
                }),
                ...(academicSelections.academicPrograms.size > 0 && {
                    academic_programs: Array.from(academicSelections.academicPrograms).map(id => id.toString())
                }),
                ...(academicSelections.programYears.size > 0 && {
                    academic_program_years: Array.from(academicSelections.programYears).map(id => id.toString())
                }),
                ...(academicSelections.academicGroups.size > 0 && {
                    academic_groups: Array.from(academicSelections.academicGroups).map(id => id.toString())
                }),
                attachments: uploadedAttachments
            };

            let announcementData: any = baseData;

            if (publicationType === 'assignment') {
                const dueDateUTC = new Date(formData.dueDate).toISOString();
                announcementData = {
                    ...baseData,
                    subject_id: formData.subjectId.trim(),
                    subject_name: formData.subjectName.trim(),
                    due_date: dueDateUTC
                };
            } else if (publicationType === 'event') {
                announcementData = {
                    ...baseData,
                    requires_confirmation: formData.requiresConfirmation,
                    requires_signature: formData.requiresSignature,
                    signature_type: formData.requiresSignature ? formData.signatureType : null,
                    confirmation_legend: formData.requiresConfirmation ? formData.confirmationLegend.trim() : null,
                    signature_legend: formData.requiresSignature ? formData.signatureLegend.trim() : null,
                    event_start_time: formData.eventStartTime ? new Date(formData.eventStartTime).toISOString() : null,
                    event_end_time: formData.eventStartTime ? computeEventEndTime(formData.eventStartTime, formData.eventDuration).toISOString() : null,
                    confirmation_deadline: formData.confirmationDeadline ? new Date(formData.confirmationDeadline).toISOString() : null,
                    event_location: formData.eventLocation.trim() || null,
                    event_url: formData.eventUrl.trim() || null,
                    map_url: formData.mapUrl.trim() || null,
                    option_list_1: formData.optionList1.length > 0 ? formData.optionList1 : null,
                    option_list_2: formData.optionList2.length > 0 ? formData.optionList2 : null,
                    label_option_1: formData.labelOption1.trim() || null,
                    label_option_2: formData.labelOption2.trim() || null,
                };
            }

            let result;
            if (announcementId) {
                const allAttachments = [...existingAttachments, ...uploadedAttachments];
                const updateDto: any = {
                    title: formData.title.trim(),
                    content: formData.content.trim(),
                    start_date: startDateUTC,
                    end_date: endDateUTC,
                    accept_comments: formData.acceptComments,
                    authorized: formData.authorized,
                    attachments: allAttachments,
                };

                if (publicationType === 'assignment') {
                    updateDto.subject_id = formData.subjectId.trim();
                    updateDto.subject_name = formData.subjectName.trim();
                    updateDto.due_date = new Date(formData.dueDate).toISOString();
                } else if (publicationType === 'event') {
                    updateDto.requires_confirmation = formData.requiresConfirmation;
                    updateDto.requires_signature = formData.requiresSignature;
                    updateDto.signature_type = formData.requiresSignature ? formData.signatureType : null;
                    updateDto.confirmation_legend = formData.requiresConfirmation ? formData.confirmationLegend.trim() : null;
                    updateDto.signature_legend = formData.requiresSignature ? formData.signatureLegend.trim() : null;
                    updateDto.event_start_time = formData.eventStartTime ? new Date(formData.eventStartTime).toISOString() : null;
                    updateDto.event_end_time = formData.eventStartTime ? computeEventEndTime(formData.eventStartTime, formData.eventDuration).toISOString() : null;
                    updateDto.confirmation_deadline = formData.confirmationDeadline ? new Date(formData.confirmationDeadline).toISOString() : null;
                    updateDto.event_location = formData.eventLocation.trim() || null;
                    updateDto.event_url = formData.eventUrl.trim() || null;
                    updateDto.map_url = formData.mapUrl.trim() || null;
                    updateDto.option_list_1 = formData.optionList1.length > 0 ? formData.optionList1 : null;
                    updateDto.option_list_2 = formData.optionList2.length > 0 ? formData.optionList2 : null;
                    updateDto.label_option_1 = formData.labelOption1.trim() || null;
                    updateDto.label_option_2 = formData.labelOption2.trim() || null;
                }

                if (publicationType === 'assignment') {
                    result = await assignmentService.update({
                        schoolId,
                        assignmentId: announcementId,
                        dto: updateDto
                    });
                } else if (publicationType === 'event') {
                    result = await eventService.update({
                        schoolId,
                        eventId: announcementId,
                        dto: updateDto
                    });
                } else {
                    result = await update({
                        schoolId,
                        announcementId,
                        dto: updateDto
                    });
                }

                const publicationId = result.id || announcementId;
                router.push(`/apps/publications?highlightId=${publicationId}&publicationType=${publicationType}`);
            } else {
                if (publicationType === 'assignment') {
                    result = await assignmentService.create({
                        schoolId,
                        dto: announcementData
                    });
                } else if (publicationType === 'event') {
                    result = await eventService.create({
                        schoolId,
                        dto: announcementData
                    });
                } else {
                    result = await create({
                        schoolId,
                        dto: announcementData
                    });
                }

                const publicationId = result.id;
                router.push(`/apps/publications?highlightId=${publicationId}&publicationType=${publicationType}`);
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

    return {
        formData,
        updateFormField,
        attachments,
        existingAttachments,
        addAttachment,
        removeAttachment,
        removeExistingAttachment,
        handleFileUpload,
        handlePublish,
        loadedAnnouncement,
        loading,
        publishLoading,
        error,
        publishError
    };
};
