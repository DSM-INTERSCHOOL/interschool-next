import { useState, useEffect } from "react";
import { subjectEnrollmentService, SubjectEnrollment } from "@/services/subject-enrollment.service";
import { getOrgConfig } from "@/lib/orgConfig";
import { useAuthStore } from "@/store/useAuthStore";

export const useTeacherSubjects = (selectedAcademicYears: Set<number>) => {
    const [subjects, setSubjects] = useState<SubjectEnrollment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { personId } = useAuthStore();

    useEffect(() => {
        const loadSubjects = async () => {
            if (!personId || selectedAcademicYears.size === 0) {
                setSubjects([]);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const { schoolId } = getOrgConfig();
                const academicYearsArray = Array.from(selectedAcademicYears);

                const enrollments = await subjectEnrollmentService.getDistinctEnrollments(
                    schoolId,
                    {
                        academic_years: academicYearsArray,
                        person_ids: personId
                    }
                );

                setSubjects(enrollments);
            } catch (err: any) {
                console.error("Error loading teacher subjects:", err);
                setError(err.message || "Error al cargar las materias");
                setSubjects([]);
            } finally {
                setLoading(false);
            }
        };

        loadSubjects();
    }, [personId, selectedAcademicYears]);

    return {
        subjects,
        loading,
        error
    };
};
