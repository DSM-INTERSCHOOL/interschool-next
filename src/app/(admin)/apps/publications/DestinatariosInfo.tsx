import { IAnnouncementRead } from "@/interfaces/IAnnouncement";
import { IAcademicYear } from "@/interfaces/IAcademicYear";
import { IAcademicStage } from "@/interfaces/IAcademicStage";
import { IAcademicProgram } from "@/interfaces/IAcademicProgram";
import { IProgramYear } from "@/interfaces/IProgramYear";
import { IAcademicGroup } from "@/interfaces/IAcademicGroup";

interface DestinatariosInfoProps {
    announcement: IAnnouncementRead;
    academicYears: IAcademicYear[];
    academicStages: IAcademicStage[];
    academicPrograms: IAcademicProgram[];
    programYears: IProgramYear[];
    academicGroups: IAcademicGroup[];
}

export const DestinatariosInfo = ({
    announcement,
    academicYears,
    academicStages,
    academicPrograms,
    programYears,
    academicGroups
}: DestinatariosInfoProps) => {
    return (
        <div className="card bg-base-100 shadow-lg">
            <div className="card-body p-4">
                <h3 className="card-title text-lg mb-3">
                    <span className="iconify lucide--info size-5"></span>
                    Información de Destinatarios
                </h3>

                <div className="overflow-x-auto">
                    <table className="table table-sm">
                        <tbody>
                            {/* Años Académicos */}
                            {announcement.academic_years && announcement.academic_years.length > 0 && (
                                <tr>
                                    <td className="font-semibold w-48">Años Académicos:</td>
                                    <td>
                                        <div className="flex flex-wrap gap-1">
                                            {announcement.academic_years.map(yearKey => {
                                                const year = academicYears.find(y => y.id === parseInt(yearKey));
                                                return year ? (
                                                    <div key={yearKey} className="badge badge-primary badge-sm">{year.academic_year_key}</div>
                                                ) : null;
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {/* Niveles Académicos */}
                            {announcement.academic_stages && announcement.academic_stages.length > 0 && (
                                <tr>
                                    <td className="font-semibold">Niveles Académicos:</td>
                                    <td>
                                        <div className="flex flex-wrap gap-1">
                                            {announcement.academic_stages.map(stageId => {
                                                const stage = academicStages.find(s => s.id === parseInt(stageId));
                                                return stage ? (
                                                    <div key={stageId} className="badge badge-secondary badge-sm">
                                                        ({stage.academic_stage_key}) {stage.description}
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {/* Programas Académicos */}
                            {announcement.academic_programs && announcement.academic_programs.length > 0 && (
                                <tr>
                                    <td className="font-semibold">Programas Académicos:</td>
                                    <td>
                                        <div className="flex flex-wrap gap-1">
                                            {announcement.academic_programs.map(programId => {
                                                const program = academicPrograms.find(p => p.id === parseInt(programId));
                                                return program ? (
                                                    <div key={programId} className="badge badge-accent badge-sm">
                                                        ({program.academic_program_key}) {program.description}
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {/* Años de Programa */}
                            {announcement.academic_program_years && announcement.academic_program_years.length > 0 && (
                                <tr>
                                    <td className="font-semibold">Años de Programa:</td>
                                    <td>
                                        <div className="flex flex-wrap gap-1">
                                            {announcement.academic_program_years.map(yearId => {
                                                const year = programYears.find(y => y.id === parseInt(yearId));
                                                return year ? (
                                                    <div key={yearId} className="badge badge-info badge-sm">{year.description}</div>
                                                ) : null;
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {/* Grupos Académicos */}
                            {announcement.academic_groups && announcement.academic_groups.length > 0 && (
                                <tr>
                                    <td className="font-semibold">Grupos Académicos:</td>
                                    <td>
                                        <div className="flex flex-wrap gap-1">
                                            {announcement.academic_groups.map(groupId => {
                                                const group = academicGroups.find(g => g.id === parseInt(groupId));
                                                return group ? (
                                                    <div key={groupId} className="badge badge-success badge-sm">{group.label}</div>
                                                ) : null;
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
