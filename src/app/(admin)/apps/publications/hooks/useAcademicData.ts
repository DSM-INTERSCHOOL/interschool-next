import { useState, useEffect } from "react";
import { IAcademicYear } from "@/interfaces/IAcademicYear";
import { IAcademicStage } from "@/interfaces/IAcademicStage";
import { IAcademicProgram } from "@/interfaces/IAcademicProgram";
import { IProgramYear } from "@/interfaces/IProgramYear";
import { IAcademicGroup } from "@/interfaces/IAcademicGroup";
import { getActiveAcademicYears } from "@/services/academic-year.service";
import { getAcademicStagesByPrecedence } from "@/services/academic-stage.service";
import { getAcademicProgramsByStages } from "@/services/academic-program.service";
import { getProgramYearsByStagesAndPrograms } from "@/services/program-year.service";
import { getAcademicGroupsByProgramYears } from "@/services/academic-group.service";

export const useAcademicData = () => {
    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [academicStages, setAcademicStages] = useState<IAcademicStage[]>([]);
    const [academicPrograms, setAcademicPrograms] = useState<IAcademicProgram[]>([]);
    const [programYears, setProgramYears] = useState<IProgramYear[]>([]);
    const [academicGroups, setAcademicGroups] = useState<IAcademicGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Cargar años académicos y niveles académicos iniciales
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

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

    // Cargar programas académicos cuando cambian los stages
    const loadAcademicPrograms = async (selectedStages: Set<number>) => {
        try {
            if (selectedStages.size > 0) {
                const stageIds = Array.from(selectedStages);
                const programs = await getAcademicProgramsByStages(stageIds);
                setAcademicPrograms(programs);
            } else {
                setAcademicPrograms([]);
            }
        } catch (err: any) {
            console.error("Error loading academic programs:", err);
            setAcademicPrograms([]);
        }
    };

    // Cargar años de programa
    const loadProgramYears = async (selectedStages: Set<number>, selectedPrograms: Set<number>) => {
        try {
            if (selectedStages.size > 0 && selectedPrograms.size > 0) {
                const stageIds = Array.from(selectedStages);
                const programIds = Array.from(selectedPrograms);
                const years = await getProgramYearsByStagesAndPrograms(stageIds, programIds);
                setProgramYears(years);
            } else {
                setProgramYears([]);
            }
        } catch (err: any) {
            console.error("Error loading program years:", err);
            setProgramYears([]);
        }
    };

    // Cargar grupos académicos
    const loadAcademicGroups = async (selectedProgramYears: Set<number>) => {
        try {
            if (selectedProgramYears.size > 0) {
                const programYearIds = Array.from(selectedProgramYears);
                const groups = await getAcademicGroupsByProgramYears(programYearIds);
                setAcademicGroups(groups);
            } else {
                setAcademicGroups([]);
            }
        } catch (err: any) {
            console.error("Error loading academic groups:", err);
            setAcademicGroups([]);
        }
    };

    return {
        academicYears,
        academicStages,
        academicPrograms,
        programYears,
        academicGroups,
        loading,
        error,
        loadAcademicPrograms,
        loadProgramYears,
        loadAcademicGroups
    };
};
