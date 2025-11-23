import { useState, useEffect } from "react";
import { IRecipient, PersonType } from "@/interfaces/IRecipient";
import { getRecipientsWithEnrollmentFilters } from "@/services/recipient.service";

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

    const loadRecipients = async (
        selectedRecipientTypes: Set<string>,
        academicFilters: AcademicFilters
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
            const personTypes = Array.from(selectedRecipientTypes) as PersonType[];

            const recipientsData = await getRecipientsWithEnrollmentFilters(personTypes, academicFilters);
            setRecipients(recipientsData);
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
