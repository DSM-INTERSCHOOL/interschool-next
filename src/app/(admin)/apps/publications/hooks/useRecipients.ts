import { useState, useEffect } from "react";
import { IRecipient, PersonType } from "@/interfaces/IRecipient";
import { getRecipientsWithEnrollmentFilters } from "@/services/recipient.service";
import { subjectEnrollmentService, SubjectEnrollment } from "@/services/subject-enrollment.service";
import { getOrgConfig } from "@/lib/orgConfig";

interface AcademicFilters {
    academic_years?: number[];
    academic_stages?: number[];
    academic_programs?: number[];
    program_years?: number[];
    academic_groups?: number[];
}

export const useRecipients = () => {
    const [recipients, setRecipients] = useState<IRecipient[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadRecipientsAsTeacher = async (
        academicFilters: AcademicFilters,
        teacherSubjects: string[]
    ) => {
        const { schoolId } = getOrgConfig();
        if (!schoolId) {
            setError("No se encontró el ID de la escuela");
            return;
        }

        const enrollments = await subjectEnrollmentService.getSubjectEnrollments(schoolId, {
            academic_years: academicFilters.academic_years,
            subject_ids: teacherSubjects
        });

        // Convertir SubjectEnrollment[] a IRecipient[]
        const recipientsMap = new Map<number, IRecipient>();

        enrollments.forEach((enrollment: SubjectEnrollment) => {
            if (!recipientsMap.has(enrollment.person_id)) {
                recipientsMap.set(enrollment.person_id, {
                    school_id: enrollment.school_id,
                    person_id: enrollment.person_id,
                    person_internal_id: enrollment.person_internal_id,
                    person_type: enrollment.person_type,
                    given_name: enrollment.given_name,
                    paternal_name: enrollment.paternal_name,
                    maternal_name: enrollment.maternal_name,
                    full_name: enrollment.full_name,
                    display_name: enrollment.display_name,
                    enrollment_type: enrollment.enrollment_type,
                    academic_year_key: enrollment.academic_year_key,
                    academic_stage_key: enrollment.academic_stage_key,
                    academic_program_key: enrollment.academic_program_key,
                    academic_modality_key: enrollment.academic_modality_key,
                    program_year_key: enrollment.program_year_key,
                    academic_group_key: enrollment.academic_group_key
                });
            }
        });

        return Array.from(recipientsMap.values());
    };

    const loadRecipients = async (
        selectedRecipientTypes: Set<string>,
        academicFilters: AcademicFilters,
        userRole?: 'admin' | 'teacher' | 'alumno' | 'unknown',
        teacherSubjects?: string[]
    ) => {
        try {
            setError(null);

            if (selectedRecipientTypes.size === 0) {
                setError("Debe seleccionar al menos un tipo de destinatario");
                return;
            }

            // Validar que hay año académico seleccionado, excepto cuando es únicamente USER
            const isOnlyUser = selectedRecipientTypes.size === 1 && selectedRecipientTypes.has('USER');
            if (!isOnlyUser && (!academicFilters.academic_years || academicFilters.academic_years.length === 0)) {
                setError("Debe seleccionar al menos un año académico");
                return;
            }

            setLoading(true);

            // Si es profesor y tiene materias, usar el servicio de subject-enrollments
            if (userRole === 'teacher' && teacherSubjects && teacherSubjects.length > 0) {
                const recipientsData = await loadRecipientsAsTeacher(academicFilters, teacherSubjects);
                setRecipients(recipientsData || []);
            } else {
                // Admin o flujo normal
                const personTypes = Array.from(selectedRecipientTypes) as PersonType[];
                const recipientsData = await getRecipientsWithEnrollmentFilters(personTypes, academicFilters);
                setRecipients(recipientsData);
            }
        } catch (err: any) {
            console.error("Error loading recipients:", err);
            setError(err.message || "Error al cargar destinatarios");
            setRecipients([]);
        } finally {
            setLoading(false);
        }
    };

    const clearRecipients = () => {
        setRecipients([]);
        setError(null);
    };

    return {
        recipients,
        loading,
        error,
        loadRecipients,
        clearRecipients
    };
};
