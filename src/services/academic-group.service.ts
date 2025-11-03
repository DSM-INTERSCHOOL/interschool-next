import api from "./api";
import { getOrgConfig } from "@/lib/orgConfig";
import {
  IAcademicGroup,
  IAcademicGroupParams,
  SchoolShift,
  IAcademicGroupDisplay,
  IAcademicGroupFilters,
  IAcademicGroupGrouped
} from "@/interfaces/IAcademicGroup";

/**
 * Get academic groups for a school
 * @param params - Query parameters for filtering academic groups
 * @returns Promise<IAcademicGroup[]> - Array of academic groups
 */
export const getAcademicGroups = async (
  params?: IAcademicGroupParams
): Promise<IAcademicGroup[]> => {
  try {
    const { schoolId } = getOrgConfig();
    const response = await api.get(`/${schoolId}/academic-groups`, { params });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching academic groups:", error);
    throw new Error("Failed to fetch academic groups");
  }
};

/**
 * Get academic groups filtered by program year IDs
 * @param programYearIds - Array of program year IDs to filter by
 * @returns Promise<IAcademicGroup[]> - Array of academic groups for selected program years
 */
export const getAcademicGroupsByProgramYears = async (
  programYearIds: number[]
): Promise<IAcademicGroup[]> => {
  try {
    if (programYearIds.length === 0) {
      return [];
    }

    const { schoolId } = getOrgConfig();
    // Create filter string: program_year_id::in::[7;6]
    const programYearIdsStr = programYearIds.join(';');
    const filters = `program_year_id::in::[${programYearIdsStr}]`;

    const response = await api.get(`/${schoolId}/academic-groups`, {
      params: { filters }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching academic groups by program years:", error);
    throw new Error("Failed to fetch academic groups by program years");
  }
};

/**
 * Get academic groups filtered by program year IDs and optionally by academic stage IDs
 * @param programYearIds - Array of program year IDs to filter by (required)
 * @param academicStageIds - Array of academic stage IDs to filter by (optional additional filter)
 * @returns Promise<IAcademicGroup[]> - Array of academic groups for selected criteria
 */
export const getAcademicGroupsByProgramYearsAndStages = async (
  programYearIds: number[],
  academicStageIds?: number[]
): Promise<IAcademicGroup[]> => {
  try {
    if (programYearIds.length === 0) {
      return [];
    }

    const { schoolId } = getOrgConfig();
    // Create filter string with program year IDs (required)
    const programYearIdsStr = programYearIds.join(';');
    let filters = `program_year_id::in::[${programYearIdsStr}]`;

    // Add academic stage filter if provided and not empty
    if (academicStageIds && academicStageIds.length > 0) {
      const stageIdsStr = academicStageIds.join(';');
      filters += `,academic_stage_id::in::[${stageIdsStr}]`;
    }

    const response = await api.get(`/${schoolId}/academic-groups`, {
      params: { filters }
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching academic groups by program years and stages:", error);
    throw new Error("Failed to fetch academic groups by program years and stages");
  }
};

/**
 * Get academic groups by school shift
 * @param schoolShift - School shift to filter by
 * @returns Promise<IAcademicGroup[]> - Array of academic groups for the shift
 */
export const getAcademicGroupsByShift = async (schoolShift: SchoolShift): Promise<IAcademicGroup[]> => {
  return getAcademicGroups({ school_shift: schoolShift });
};

/**
 * Get academic group by ID
 * @param academicGroupId - The ID of the academic group
 * @returns Promise<IAcademicGroup> - Single academic group
 */
export const getAcademicGroupById = async (
  academicGroupId: number
): Promise<IAcademicGroup> => {
  try {
    const { schoolId } = getOrgConfig();
    const response = await api.get(`/${schoolId}/academic-groups/${academicGroupId}`);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching academic group by ID:", error);
    throw new Error(`Failed to fetch academic group with ID: ${academicGroupId}`);
  }
};

/**
 * Get academic group by key
 * @param academicGroupKey - The key of the academic group (e.g., "A", "B", "1A")
 * @param programYearId - Optional program year ID to narrow the search
 * @returns Promise<IAcademicGroup | null> - Single academic group or null if not found
 */
export const getAcademicGroupByKey = async (
  academicGroupKey: string,
  programYearId?: number
): Promise<IAcademicGroup | null> => {
  try {
    const params = programYearId ? { program_year_id: programYearId } : undefined;
    const academicGroups = await getAcademicGroups(params);
    const found = academicGroups.find(
      (group) => group.academic_group_key === academicGroupKey
    );
    
    return found || null;
  } catch (error) {
    console.error("Error fetching academic group by key:", error);
    throw new Error(`Failed to fetch academic group with key: ${academicGroupKey}`);
  }
};

/**
 * Get academic groups for display purposes, filtered by selected program years
 * @param selectedProgramYearIds - Array of selected program year IDs
 * @param selectedAcademicStageIds - Optional array of academic stage IDs for additional filtering
 * @returns Promise<IAcademicGroupDisplay[]> - Array of simplified academic groups
 */
export const getAcademicGroupsForDisplay = async (
  selectedProgramYearIds: number[],
  selectedAcademicStageIds?: number[]
): Promise<IAcademicGroupDisplay[]> => {
  try {
    const groups = await getAcademicGroupsByProgramYearsAndStages(
      selectedProgramYearIds, 
      selectedAcademicStageIds
    );
    
    return groups.map((group) => ({
      id: group.id,
      label: group.label,
      key: group.academic_group_key,
      school_shift: group.school_shift,
      program_year_id: group.program_year_id,
      academic_stage_id: group.academic_stage_id,
    }));
  } catch (error) {
    console.error("Error fetching academic groups for display:", error);
    throw new Error("Failed to fetch academic groups for display");
  }
};

/**
 * Get academic groups grouped by program year
 * @param selectedProgramYearIds - Array of selected program year IDs
 * @param selectedAcademicStageIds - Optional array of academic stage IDs for additional filtering
 * @returns Promise<IAcademicGroupGrouped> - Academic groups grouped by program year ID
 */
export const getAcademicGroupsGrouped = async (
  selectedProgramYearIds: number[],
  selectedAcademicStageIds?: number[]
): Promise<IAcademicGroupGrouped> => {
  try {
    const groups = await getAcademicGroupsByProgramYearsAndStages(
      selectedProgramYearIds, 
      selectedAcademicStageIds
    );
    
    // Group by program_year_id
    const grouped: IAcademicGroupGrouped = {};
    
    groups.forEach((group) => {
      const programYearId = group.program_year_id;
      if (!grouped[programYearId]) {
        grouped[programYearId] = [];
      }
      grouped[programYearId].push(group);
    });
    
    // Sort each group by academic group key/description
    Object.keys(grouped).forEach((programYearId) => {
      grouped[parseInt(programYearId)].sort((a, b) => {
        return a.academic_group_key.localeCompare(b.academic_group_key);
      });
    });
    
    return grouped;
  } catch (error) {
    console.error("Error fetching academic groups grouped:", error);
    throw new Error("Failed to fetch academic groups grouped");
  }
};

/**
 * Get academic groups filtered by multiple criteria
 * @param filters - Filter criteria including program year IDs and optional stage IDs
 * @returns Promise<IAcademicGroup[]> - Array of filtered academic groups
 */
export const getFilteredAcademicGroups = async (
  filters: IAcademicGroupFilters
): Promise<IAcademicGroup[]> => {
  try {
    if (filters.program_year_ids && filters.program_year_ids.length > 0) {
      // Use program year based filtering (required dependency)
      return getAcademicGroupsByProgramYearsAndStages(
        filters.program_year_ids, 
        filters.academic_stage_ids
      );
    } else {
      // If no program year IDs provided, return empty array since it's required
      return [];
    }
  } catch (error) {
    console.error("Error fetching filtered academic groups:", error);
    throw new Error("Failed to fetch filtered academic groups");
  }
};

/**
 * Get academic groups by specific program year and optional academic stage
 * @param programYearId - Program year ID (required)
 * @param academicStageId - Academic stage ID (optional)
 * @returns Promise<IAcademicGroup[]> - Array of academic groups for specific criteria
 */
export const getAcademicGroupsByProgramYearAndStage = async (
  programYearId: number,
  academicStageId?: number
): Promise<IAcademicGroup[]> => {
  try {
    const stageIds = academicStageId ? [academicStageId] : undefined;
    return getAcademicGroupsByProgramYearsAndStages([programYearId], stageIds);
  } catch (error) {
    console.error("Error fetching academic groups by program year and stage:", error);
    throw new Error("Failed to fetch academic groups by program year and stage");
  }
};