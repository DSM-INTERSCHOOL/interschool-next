import api from "./api";
import { getOrgConfig } from "@/lib/orgConfig";
import {
  IProgramYear,
  IProgramYearParams,
  IProgramYearDisplay,
  IProgramYearFilters,
  IProgramYearGrouped
} from "@/interfaces/IProgramYear";

/**
 * Get program years for a school
 * @param params - Query parameters for filtering program years
 * @returns Promise<IProgramYear[]> - Array of program years
 */
export const getProgramYears = async (
  params?: IProgramYearParams
): Promise<IProgramYear[]> => {
  try {
    const { schoolId } = getOrgConfig();
    const response = await api.get(`/${schoolId}/program-years`, { params });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching program years:", error);
    throw new Error("Failed to fetch program years");
  }
};

/**
 * Get program years filtered by academic stage IDs and academic program IDs
 * @param stageIds - Array of academic stage IDs to filter by
 * @param programIds - Array of academic program IDs to filter by
 * @returns Promise<IProgramYear[]> - Array of program years for selected stages and programs
 */
export const getProgramYearsByStagesAndPrograms = async (
  stageIds: number[],
  programIds: number[]
): Promise<IProgramYear[]> => {
  try {
    if (stageIds.length === 0 || programIds.length === 0) {
      return [];
    }

    const { schoolId } = getOrgConfig();
    // Create filter string: academic_stage_id::in::[1;2],academic_program_id::in::[1;2]
    const stageIdsStr = stageIds.join(';');
    const programIdsStr = programIds.join(';');
    const filters = `academic_stage_id::in::[${stageIdsStr}],academic_program_id::in::[${programIdsStr}]`;

    const response = await api.get(`/${schoolId}/program-years`, {
      params: { filters }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching program years by stages and programs:", error);
    throw new Error("Failed to fetch program years by stages and programs");
  }
};

/**
 * Get program year by ID
 * @param programYearId - The ID of the program year
 * @returns Promise<IProgramYear> - Single program year
 */
export const getProgramYearById = async (
  programYearId: number
): Promise<IProgramYear> => {
  try {
    const { schoolId } = getOrgConfig();
    const response = await api.get(`/${schoolId}/program-years/${programYearId}`);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching program year by ID:", error);
    throw new Error(`Failed to fetch program year with ID: ${programYearId}`);
  }
};

/**
 * Get program year by key
 * @param programYearKey - The key of the program year (e.g., "1", "2", "0PF")
 * @returns Promise<IProgramYear | null> - Single program year or null if not found
 */
export const getProgramYearByKey = async (
  programYearKey: string
): Promise<IProgramYear | null> => {
  try {
    const programYears = await getProgramYears();
    const found = programYears.find(
      (year) => year.program_year_key === programYearKey
    );
    
    return found || null;
  } catch (error) {
    console.error("Error fetching program year by key:", error);
    throw new Error(`Failed to fetch program year with key: ${programYearKey}`);
  }
};

/**
 * Get program years for display purposes, filtered by selected stages and programs
 * @param selectedStageIds - Array of selected academic stage IDs
 * @param selectedProgramIds - Array of selected academic program IDs
 * @returns Promise<IProgramYearDisplay[]> - Array of simplified program years
 */
export const getProgramYearsForDisplay = async (
  selectedStageIds: number[],
  selectedProgramIds: number[]
): Promise<IProgramYearDisplay[]> => {
  try {
    const years = await getProgramYearsByStagesAndPrograms(selectedStageIds, selectedProgramIds);
    
    return years.map((year) => ({
      id: year.id,
      key: year.program_year_key,
      description: year.description,
      academic_stage_id: year.academic_stage_id,
      academic_program_id: year.academic_program_id,
      academic_modality_id: year.academic_modality_id,
    }));
  } catch (error) {
    console.error("Error fetching program years for display:", error);
    throw new Error("Failed to fetch program years for display");
  }
};

/**
 * Get program years grouped by academic stage and program
 * @param selectedStageIds - Array of selected academic stage IDs
 * @param selectedProgramIds - Array of selected academic program IDs
 * @returns Promise<IProgramYearGrouped> - Program years grouped by stage ID and program ID
 */
export const getProgramYearsGrouped = async (
  selectedStageIds: number[],
  selectedProgramIds: number[]
): Promise<IProgramYearGrouped> => {
  try {
    const years = await getProgramYearsByStagesAndPrograms(selectedStageIds, selectedProgramIds);
    
    // Group by academic_stage_id and then by academic_program_id
    const grouped: IProgramYearGrouped = {};
    
    years.forEach((year) => {
      const stageId = year.academic_stage_id;
      const programId = year.academic_program_id;
      
      if (!grouped[stageId]) {
        grouped[stageId] = {};
      }
      if (!grouped[stageId][programId]) {
        grouped[stageId][programId] = [];
      }
      
      grouped[stageId][programId].push(year);
    });
    
    // Sort each group by program year key/description
    Object.keys(grouped).forEach((stageId) => {
      Object.keys(grouped[parseInt(stageId)]).forEach((programId) => {
        grouped[parseInt(stageId)][parseInt(programId)].sort((a, b) => {
          // Try to sort numerically first, then alphabetically
          const aNum = parseInt(a.program_year_key);
          const bNum = parseInt(b.program_year_key);
          
          if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
          }
          
          return a.program_year_key.localeCompare(b.program_year_key);
        });
      });
    });
    
    return grouped;
  } catch (error) {
    console.error("Error fetching program years grouped:", error);
    throw new Error("Failed to fetch program years grouped");
  }
};

/**
 * Get program years filtered by multiple criteria with dual dependency
 * @param filters - Filter criteria including stage IDs and program IDs
 * @returns Promise<IProgramYear[]> - Array of filtered program years
 */
export const getFilteredProgramYears = async (
  filters: IProgramYearFilters
): Promise<IProgramYear[]> => {
  try {
    if (filters.academic_stage_ids && filters.academic_program_ids &&
        filters.academic_stage_ids.length > 0 && filters.academic_program_ids.length > 0) {
      // Use dual dependency filtering
      return getProgramYearsByStagesAndPrograms(filters.academic_stage_ids, filters.academic_program_ids);
    } else {
      // If missing either dependency, return empty array
      return [];
    }
  } catch (error) {
    console.error("Error fetching filtered program years:", error);
    throw new Error("Failed to fetch filtered program years");
  }
};

/**
 * Get program years by specific stage and program combination
 * @param stageId - Academic stage ID
 * @param programId - Academic program ID
 * @returns Promise<IProgramYear[]> - Array of program years for specific stage-program combination
 */
export const getProgramYearsByStageAndProgram = async (
  stageId: number,
  programId: number
): Promise<IProgramYear[]> => {
  try {
    return getProgramYearsByStagesAndPrograms([stageId], [programId]);
  } catch (error) {
    console.error("Error fetching program years by stage and program:", error);
    throw new Error("Failed to fetch program years by stage and program");
  }
};