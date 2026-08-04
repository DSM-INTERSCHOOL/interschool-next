import { useState, useCallback } from "react";

export const useSelections = () => {
    const [selectedAcademicYears, setSelectedAcademicYears] = useState<Set<number>>(new Set());
    const [selectedAcademicStages, setSelectedAcademicStages] = useState<Set<number>>(new Set());
    const [selectedAcademicPrograms, setSelectedAcademicPrograms] = useState<Set<number>>(new Set());
    const [selectedProgramYears, setSelectedProgramYears] = useState<Set<number>>(new Set());
    const [selectedAcademicGroups, setSelectedAcademicGroups] = useState<Set<number>>(new Set());
    const [selectedRecipientTypes, setSelectedRecipientTypes] = useState<Set<string>>(new Set());
    const [selectedRecipients, setSelectedRecipients] = useState<Set<number>>(new Set());

    const toggleItem = useCallback(<T extends number | string>(
        setter: React.Dispatch<React.SetStateAction<Set<T>>>,
        id: T,
        isSelected: boolean
    ) => {
        setter(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(id);
            } else {
                newSet.delete(id);
            }
            return newSet;
        });
    }, []);

    const selectAll = useCallback(<T extends number | string>(
        setter: React.Dispatch<React.SetStateAction<Set<T>>>,
        ids: T[],
        isSelected: boolean
    ) => {
        if (isSelected) {
            setter(new Set(ids));
        } else {
            setter(new Set());
        }
    }, []);

    // Academic Years
    const handleAcademicYearToggle = useCallback((yearId: number, isSelected: boolean) => {
        toggleItem(setSelectedAcademicYears, yearId, isSelected);
    }, [toggleItem]);

    const handleSelectAllAcademicYears = useCallback((ids: number[], isSelected: boolean) => {
        selectAll(setSelectedAcademicYears, ids, isSelected);
    }, [selectAll]);

    // Academic Stages
    const handleAcademicStageToggle = useCallback((stageId: number, isSelected: boolean) => {
        toggleItem(setSelectedAcademicStages, stageId, isSelected);
    }, [toggleItem]);

    const handleSelectAllAcademicStages = useCallback((ids: number[], isSelected: boolean) => {
        selectAll(setSelectedAcademicStages, ids, isSelected);
    }, [selectAll]);

    // Academic Programs
    const handleAcademicProgramToggle = useCallback((programId: number, isSelected: boolean) => {
        toggleItem(setSelectedAcademicPrograms, programId, isSelected);
    }, [toggleItem]);

    const handleSelectAllAcademicPrograms = useCallback((ids: number[], isSelected: boolean) => {
        selectAll(setSelectedAcademicPrograms, ids, isSelected);
    }, [selectAll]);

    // Program Years
    const handleProgramYearToggle = useCallback((yearId: number, isSelected: boolean) => {
        toggleItem(setSelectedProgramYears, yearId, isSelected);
    }, [toggleItem]);

    const handleSelectAllProgramYears = useCallback((ids: number[], isSelected: boolean) => {
        selectAll(setSelectedProgramYears, ids, isSelected);
    }, [selectAll]);

    // Academic Groups
    const handleAcademicGroupToggle = useCallback((groupId: number, isSelected: boolean) => {
        toggleItem(setSelectedAcademicGroups, groupId, isSelected);
    }, [toggleItem]);

    const handleSelectAllAcademicGroups = useCallback((ids: number[], isSelected: boolean) => {
        selectAll(setSelectedAcademicGroups, ids, isSelected);
    }, [selectAll]);

    // Recipient Types
    const handleRecipientTypeToggle = useCallback((type: string, isSelected: boolean) => {
        toggleItem(setSelectedRecipientTypes, type, isSelected);
    }, [toggleItem]);

    const handleSelectAllRecipientTypes = useCallback((isSelected: boolean) => {
        const types: string[] = ['STUDENT', 'TEACHER', 'USER', 'RELATIVE'];
        selectAll(setSelectedRecipientTypes, types, isSelected);
    }, [selectAll]);

    // Recipients
    const handleRecipientToggle = useCallback((personId: number, isSelected: boolean) => {
        toggleItem(setSelectedRecipients, personId, isSelected);
    }, [toggleItem]);

    const handleSelectAllRecipients = useCallback((ids: number[], isSelected: boolean) => {
        selectAll(setSelectedRecipients, ids, isSelected);
    }, [selectAll]);

    // Preload selections from loaded announcement
    const preloadSelections = useCallback((announcement: any, academicYears: any[]) => {
        if (announcement.academic_years) {
            const yearIds = announcement.academic_years
                .map((yearKey: string) => academicYears.find(y => y.id === parseInt(yearKey))?.id)
                .filter((id: number | undefined): id is number => id !== undefined);
            setSelectedAcademicYears(new Set(yearIds));
        }

        if (announcement.academic_stages) {
            setSelectedAcademicStages(new Set(announcement.academic_stages.map((s: string) => parseInt(s))));
        }
        if (announcement.academic_programs) {
            setSelectedAcademicPrograms(new Set(announcement.academic_programs.map((p: string) => parseInt(p))));
        }
        if (announcement.academic_program_years) {
            setSelectedProgramYears(new Set(announcement.academic_program_years.map((py: string) => parseInt(py))));
        }
        if (announcement.academic_groups) {
            setSelectedAcademicGroups(new Set(announcement.academic_groups.map((g: string) => parseInt(g))));
        }
    }, []);

    return {
        // State
        selectedAcademicYears,
        selectedAcademicStages,
        selectedAcademicPrograms,
        selectedProgramYears,
        selectedAcademicGroups,
        selectedRecipientTypes,
        selectedRecipients,
        // Setters
        setSelectedAcademicYears,
        setSelectedAcademicStages,
        setSelectedAcademicPrograms,
        setSelectedProgramYears,
        setSelectedAcademicGroups,
        setSelectedRecipientTypes,
        setSelectedRecipients,
        // Handlers
        handleAcademicYearToggle,
        handleSelectAllAcademicYears,
        handleAcademicStageToggle,
        handleSelectAllAcademicStages,
        handleAcademicProgramToggle,
        handleSelectAllAcademicPrograms,
        handleProgramYearToggle,
        handleSelectAllProgramYears,
        handleAcademicGroupToggle,
        handleSelectAllAcademicGroups,
        handleRecipientTypeToggle,
        handleSelectAllRecipientTypes,
        handleRecipientToggle,
        handleSelectAllRecipients,
        preloadSelections
    };
};
