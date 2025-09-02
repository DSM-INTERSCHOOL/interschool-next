import api from "./api";
import { 
  IAcademicStage, 
  IAcademicStageParams, 
  AcademicStageStatus,
  IAcademicStageDisplay 
} from "@/interfaces/IAcademicStage";

const SCHOOL_ID = process.env.NEXT_PUBLIC_SCHOOL_ID || "1000";

/**
 * Get academic stages for a school
 * @param params - Query parameters for filtering academic stages
 * @returns Promise<IAcademicStage[]> - Array of academic stages
 */
export const getAcademicStages = async (
  params?: IAcademicStageParams
): Promise<IAcademicStage[]> => {
  try {
    const response = await api.get(`/${SCHOOL_ID}/academic-stages`, { params });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching academic stages:", error);
    throw new Error("Failed to fetch academic stages");
  }
};

/**
 * Get only active academic stages
 * @returns Promise<IAcademicStage[]> - Array of active academic stages
 */
export const getActiveAcademicStages = async (): Promise<IAcademicStage[]> => {
  return getAcademicStages({ status: AcademicStageStatus.ACTIVO });
};

/**
 * Get academic stage by ID
 * @param academicStageId - The ID of the academic stage
 * @returns Promise<IAcademicStage> - Single academic stage
 */
export const getAcademicStageById = async (
  academicStageId: number
): Promise<IAcademicStage> => {
  try {
    const response = await api.get(`/${SCHOOL_ID}/academic-stages/${academicStageId}`);
    
    return response.data;
  } catch (error) {
    console.error("Error fetching academic stage by ID:", error);
    throw new Error(`Failed to fetch academic stage with ID: ${academicStageId}`);
  }
};

/**
 * Get academic stage by key
 * @param academicStageKey - The key of the academic stage (e.g., "BA", "PR", "SE")
 * @returns Promise<IAcademicStage | null> - Single academic stage or null if not found
 */
export const getAcademicStageByKey = async (
  academicStageKey: string
): Promise<IAcademicStage | null> => {
  try {
    const academicStages = await getAcademicStages();
    const found = academicStages.find(
      (stage) => stage.academic_stage_key === academicStageKey
    );
    
    return found || null;
  } catch (error) {
    console.error("Error fetching academic stage by key:", error);
    throw new Error(`Failed to fetch academic stage with key: ${academicStageKey}`);
  }
};

/**
 * Get academic stages sorted by precedence (educational order)
 * @returns Promise<IAcademicStage[]> - Array of academic stages ordered by precedence
 */
export const getAcademicStagesByPrecedence = async (): Promise<IAcademicStage[]> => {
  try {
    const stages = await getActiveAcademicStages();
    
    // Sort by precedence ascending (FID=0, DAYCARE=1, MATERNAL=2, etc.)
    return stages.sort((a, b) => a.precedence - b.precedence);
  } catch (error) {
    console.error("Error fetching academic stages by precedence:", error);
    throw new Error("Failed to fetch academic stages by precedence");
  }
};

/**
 * Get simplified academic stages for display purposes
 * @returns Promise<IAcademicStageDisplay[]> - Array of simplified academic stages
 */
export const getAcademicStagesForDisplay = async (): Promise<IAcademicStageDisplay[]> => {
  try {
    const stages = await getAcademicStagesByPrecedence();
    
    return stages.map((stage) => ({
      id: stage.id,
      key: stage.academic_stage_key,
      description: stage.description,
      precedence: stage.precedence,
      educationLevel: stage.academic_stage_iedu || "Sin especificar",
      status: stage.status,
    }));
  } catch (error) {
    console.error("Error fetching academic stages for display:", error);
    throw new Error("Failed to fetch academic stages for display");
  }
};

/**
 * Get academic stages grouped by education level
 * @returns Promise<Record<string, IAcademicStage[]>> - Academic stages grouped by education level
 */
export const getAcademicStagesByEducationLevel = async (): Promise<Record<string, IAcademicStage[]>> => {
  try {
    const stages = await getActiveAcademicStages();
    
    // Group by education level
    const grouped: Record<string, IAcademicStage[]> = {};
    
    stages.forEach((stage) => {
      const level = stage.academic_stage_iedu || "Sin especificar";
      if (!grouped[level]) {
        grouped[level] = [];
      }
      grouped[level].push(stage);
    });
    
    // Sort each group by precedence
    Object.keys(grouped).forEach((level) => {
      grouped[level].sort((a, b) => a.precedence - b.precedence);
    });
    
    return grouped;
  } catch (error) {
    console.error("Error fetching academic stages by education level:", error);
    throw new Error("Failed to fetch academic stages by education level");
  }
};