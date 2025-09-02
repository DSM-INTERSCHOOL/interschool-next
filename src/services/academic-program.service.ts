import api from "./api";
import { 
  IAcademicProgram, 
  IAcademicProgramParams, 
  AcademicProgramStatus,
  IAcademicProgramDisplay,
  IAcademicProgramFilters 
} from "@/interfaces/IAcademicProgram";

const SCHOOL_ID = process.env.NEXT_PUBLIC_SCHOOL_ID || "1000";

/**
 * Get academic programs for a school
 * @param params - Query parameters for filtering academic programs
 * @returns Promise<IAcademicProgram[]> - Array of academic programs
 */
export const getAcademicPrograms = async (
  params?: IAcademicProgramParams
): Promise<IAcademicProgram[]> => {
  try {
    const response = await api.get(`/${SCHOOL_ID}/academic-programs`, { params });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching academic programs:", error);
    throw new Error("Failed to fetch academic programs");
  }
};

/**
 * Get only active academic programs
 * @returns Promise<IAcademicProgram[]> - Array of active academic programs
 */
export const getActiveAcademicPrograms = async (): Promise<IAcademicProgram[]> => {
  return getAcademicPrograms({ status: AcademicProgramStatus.ACTIVO });
};

/**
 * Get academic programs filtered by academic stage IDs
 * @param stageIds - Array of academic stage IDs to filter by
 * @returns Promise<IAcademicProgram[]> - Array of academic programs for selected stages
 */
export const getAcademicProgramsByStages = async (
  stageIds: number[]
): Promise<IAcademicProgram[]> => {
  try {
    if (stageIds.length === 0) {
      return [];
    }

    // Create filter string: academic_stage_id::in::[1;2;3]
    const stageIdsStr = stageIds.join(';');
    const filters = `academic_stage_id::in::[${stageIdsStr}]`;
    
    const response = await api.get(`/${SCHOOL_ID}/academic-programs`, {
      params: { filters }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching academic programs by stages:", error);
    throw new Error("Failed to fetch academic programs by stages");
  }
};

/**
 * Get academic program by ID
 * @param academicProgramId - The ID of the academic program
 * @returns Promise<IAcademicProgram> - Single academic program
 */
export const getAcademicProgramById = async (
  academicProgramId: number
): Promise<IAcademicProgram> => {
  try {
    const response = await api.get(`/${SCHOOL_ID}/academic-programs/${academicProgramId}`);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching academic program by ID:", error);
    throw new Error(`Failed to fetch academic program with ID: ${academicProgramId}`);
  }
};

/**
 * Get academic program by key
 * @param academicProgramKey - The key of the academic program (e.g., "PRBASICO", "BABASICO")
 * @returns Promise<IAcademicProgram | null> - Single academic program or null if not found
 */
export const getAcademicProgramByKey = async (
  academicProgramKey: string
): Promise<IAcademicProgram | null> => {
  try {
    const academicPrograms = await getAcademicPrograms();
    const found = academicPrograms.find(
      (program) => program.academic_program_key === academicProgramKey
    );
    
    return found || null;
  } catch (error) {
    console.error("Error fetching academic program by key:", error);
    throw new Error(`Failed to fetch academic program with key: ${academicProgramKey}`);
  }
};

/**
 * Get academic programs for display purposes, filtered by selected stages
 * @param selectedStageIds - Array of selected academic stage IDs
 * @returns Promise<IAcademicProgramDisplay[]> - Array of simplified academic programs
 */
export const getAcademicProgramsForDisplay = async (
  selectedStageIds: number[]
): Promise<IAcademicProgramDisplay[]> => {
  try {
    const programs = await getAcademicProgramsByStages(selectedStageIds);
    
    return programs.map((program) => ({
      id: program.id,
      key: program.academic_program_key,
      description: program.description,
      status: program.status,
      academic_stage_id: program.academic_stage_id,
    }));
  } catch (error) {
    console.error("Error fetching academic programs for display:", error);
    throw new Error("Failed to fetch academic programs for display");
  }
};

/**
 * Get academic programs grouped by academic stage
 * @param selectedStageIds - Array of selected academic stage IDs
 * @returns Promise<Record<number, IAcademicProgram[]>> - Academic programs grouped by stage ID
 */
export const getAcademicProgramsByStageGroup = async (
  selectedStageIds: number[]
): Promise<Record<number, IAcademicProgram[]>> => {
  try {
    const programs = await getAcademicProgramsByStages(selectedStageIds);
    
    // Group by academic_stage_id
    const grouped: Record<number, IAcademicProgram[]> = {};
    
    programs.forEach((program) => {
      const stageId = program.academic_stage_id;
      if (!grouped[stageId]) {
        grouped[stageId] = [];
      }
      grouped[stageId].push(program);
    });
    
    return grouped;
  } catch (error) {
    console.error("Error fetching academic programs by stage group:", error);
    throw new Error("Failed to fetch academic programs by stage group");
  }
};

/**
 * Get active academic programs filtered by multiple criteria
 * @param filters - Filter criteria including stage IDs and status
 * @returns Promise<IAcademicProgram[]> - Array of filtered academic programs
 */
export const getFilteredAcademicPrograms = async (
  filters: IAcademicProgramFilters
): Promise<IAcademicProgram[]> => {
  try {
    if (filters.academic_stage_ids && filters.academic_stage_ids.length > 0) {
      // Use stage-based filtering
      const programs = await getAcademicProgramsByStages(filters.academic_stage_ids);
      
      // Additional status filtering if specified
      if (filters.status) {
        return programs.filter(program => program.status === filters.status);
      }
      
      return programs;
    } else {
      // Fallback to general filtering
      return getAcademicPrograms({ status: filters.status });
    }
  } catch (error) {
    console.error("Error fetching filtered academic programs:", error);
    throw new Error("Failed to fetch filtered academic programs");
  }
};