"use client";

import { useState, useEffect } from "react";
import { DestinatariosInfo } from "./DestinatariosInfo";
import {
    PublicationTypeSelector,
    RecipientTypeSelector,
    AcademicSelector,
    RecipientTable,
    PublicationFormCard,
    SubjectSelector
} from "./components";
import {
    useAcademicData,
    useRecipients,
    usePublicationForm,
    useSelections,
    useUserRole,
    useTeacherSubjects
} from "./hooks";

interface PublicationsAppProps {
    announcementId?: string;
    type?: 'announcement' | 'assignment';
}

const PublicationsApp = ({ announcementId, type }: PublicationsAppProps) => {
    const [publicationType, setPublicationType] = useState<'announcement' | 'assignment'>(type || 'announcement');
    const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());

    // Custom hooks
    const userRole = useUserRole();
    const academicData = useAcademicData();
    const selections = useSelections();
    const recipientsData = useRecipients();
    const publicationForm = usePublicationForm(announcementId, publicationType);
    const teacherSubjects = useTeacherSubjects(selections.selectedAcademicYears);

    console.log('publicacionapp userRole', userRole);

    const isTeacher = userRole === 'teacher';
    const isAdmin = userRole === 'admin';
    const isAssignment = publicationType === 'assignment';

    console.log('isTeacher', isTeacher);
    console.log('isAdmin', isAdmin);

    // Seleccionar STUDENT por defecto para profesores
    useEffect(() => {
        if (isTeacher && !announcementId && selections.selectedRecipientTypes.size === 0) {
            selections.handleRecipientTypeToggle('STUDENT', true);
        }
    }, [isTeacher, announcementId]);

    // Cargar programas académicos cuando cambian los stages seleccionados
    useEffect(() => {
        academicData.loadAcademicPrograms(selections.selectedAcademicStages);
        // Limpiar selecciones dependientes
        selections.setSelectedAcademicPrograms(new Set());
    }, [selections.selectedAcademicStages]);

    // Cargar años de programa cuando cambian stages y programs
    useEffect(() => {
        academicData.loadProgramYears(
            selections.selectedAcademicStages,
            selections.selectedAcademicPrograms
        );
        // Limpiar selecciones dependientes
        selections.setSelectedProgramYears(new Set());
    }, [selections.selectedAcademicStages, selections.selectedAcademicPrograms]);

    // Cargar grupos académicos cuando cambian program years
    useEffect(() => {
        academicData.loadAcademicGroups(selections.selectedProgramYears);
        // Limpiar selecciones dependientes
        selections.setSelectedAcademicGroups(new Set());
    }, [selections.selectedProgramYears]);

    // Resetear recipients cuando cambian los filtros
    useEffect(() => {
        recipientsData.clearRecipients();
        selections.setSelectedRecipients(new Set());
    }, [
        selections.selectedRecipientTypes,
        selections.selectedAcademicYears,
        selections.selectedAcademicStages,
        selections.selectedAcademicPrograms,
        selections.selectedProgramYears,
        selections.selectedAcademicGroups
    ]);

    // Prellenar selecciones cuando se carga el announcement
    useEffect(() => {
        if (publicationForm.loadedAnnouncement && academicData.academicYears.length > 0) {
            selections.preloadSelections(
                publicationForm.loadedAnnouncement,
                academicData.academicYears
            );
        }
    }, [publicationForm.loadedAnnouncement, academicData.academicYears]);

    const handleLoadRecipients = () => {
        // Para profesores: extraer datos de las materias seleccionadas
        console.log('in handleLoadRecipients isTeacher', isTeacher  );
        if (isTeacher) {
            // Crear mapa de materias con uniqueId
            const subjectsMap = new Map();
            teacherSubjects.subjects.forEach(subject => {
                const uniqueId = `${subject.subject_id}_${subject.academic_group_id || 'no-group'}_${subject.program_year_id}`;
                subjectsMap.set(uniqueId, subject);
            });

            // Obtener solo las materias seleccionadas
            const selectedSubjectObjects = Array.from(selectedSubjects)
                .map(uniqueId => subjectsMap.get(uniqueId))
                .filter(Boolean);

            // Extraer IDs únicos de los campos académicos
            const subjectIds = Array.from(new Set(
                selectedSubjectObjects.map(s => s.subject_id)
            ));
            const academicStageIds = Array.from(new Set(
                selectedSubjectObjects
                    .map(s => s.academic_stage_id)
                    .filter((id): id is number => id !== null && id !== undefined)
            ));
            const programYearIds = Array.from(new Set(
                selectedSubjectObjects
                    .map(s => s.program_year_id)
                    .filter((id): id is number => id !== null && id !== undefined)
            ));
            const academicGroupIds = Array.from(new Set(
                selectedSubjectObjects
                    .map(s => s.academic_group_id)
                    .filter((id): id is number => id !== null && id !== undefined)
            ));

            recipientsData.loadRecipients(
                selections.selectedRecipientTypes,
                {
                    academic_years: selections.selectedAcademicYears.size > 0
                        ? Array.from(selections.selectedAcademicYears)
                        : undefined,
                    academic_stages: academicStageIds.length > 0 ? academicStageIds : undefined,
                    program_years: programYearIds.length > 0 ? programYearIds : undefined,
                    academic_groups: academicGroupIds.length > 0 ? academicGroupIds : undefined,
                },
                userRole,
                subjectIds.length > 0 ? subjectIds : undefined
            );
        } else {
            // Para admin: usar los filtros académicos seleccionados
            recipientsData.loadRecipients(
                selections.selectedRecipientTypes,
                {
                    academic_years: selections.selectedAcademicYears.size > 0
                        ? Array.from(selections.selectedAcademicYears)
                        : undefined,
                    academic_stages: selections.selectedAcademicStages.size > 0
                        ? Array.from(selections.selectedAcademicStages)
                        : undefined,
                    academic_programs: selections.selectedAcademicPrograms.size > 0
                        ? Array.from(selections.selectedAcademicPrograms)
                        : undefined,
                    program_years: selections.selectedProgramYears.size > 0
                        ? Array.from(selections.selectedProgramYears)
                        : undefined,
                    academic_groups: selections.selectedAcademicGroups.size > 0
                        ? Array.from(selections.selectedAcademicGroups)
                        : undefined,
                },
                userRole
            );
        }
    };

    const handleSubjectToggle = (subjectId: string, isSelected: boolean) => {
        const newSelection = new Set(selectedSubjects);
        if (isSelected) {
            newSelection.add(subjectId);
        } else {
            newSelection.delete(subjectId);
        }
        setSelectedSubjects(newSelection);
    };

    const handleSelectAllSubjects = (isSelected: boolean) => {
        if (isSelected) {
            // Crear uniqueIds para todas las materias
            const allUniqueIds = teacherSubjects.subjects.map(subject =>
                `${subject.subject_id}_${subject.academic_group_id || 'no-group'}_${subject.program_year_id}`
            );
            setSelectedSubjects(new Set(allUniqueIds));
        } else {
            setSelectedSubjects(new Set());
        }
    };

    

    const handlePublish = () => {
        publicationForm.handlePublish(
            selections.selectedRecipients,
            {
                academicYears: selections.selectedAcademicYears,
                academicStages: selections.selectedAcademicStages,
                academicPrograms: selections.selectedAcademicPrograms,
                programYears: selections.selectedProgramYears,
                academicGroups: selections.selectedAcademicGroups,
            }
        );
    };

    const isOnlyUser = selections.selectedRecipientTypes.size === 1 && selections.selectedRecipientTypes.has('USER');
    const shouldShowAcademicSelectors = !isOnlyUser;
    const shouldShowForm = selections.selectedAcademicYears.size > 0 ||
                          selections.selectedAcademicStages.size > 0 ||
                          isOnlyUser;

    return (
        <div className="bg-base-100 rounded-lg shadow-sm">
            <div className="p-6 border-b border-base-300">
                <h2 className="text-2xl font-bold text-base-content">
                    Centro de Publicaciones
                </h2>
                <p className="text-base-content/70 mt-2">
                    Crear y gestionar avisos para los años académicos seleccionados
                </p>
            </div>

            <div className="p-6">
                <div className="space-y-6">
                    {/* Selección de tipo de publicación - Solo en modo creación */}
                    {!announcementId && (
                        <PublicationTypeSelector
                            value={publicationType}
                            onChange={setPublicationType}
                        />
                    )}

                    {/* Selección de tipos de destinatarios - Solo en modo creación */}
                    {!announcementId  && (
                        <RecipientTypeSelector
                            selected={selections.selectedRecipientTypes}
                            onToggle={selections.handleRecipientTypeToggle}
                            onSelectAll={selections.handleSelectAllRecipientTypes}
                            userRole={userRole}
                        />
                    )}

                    {/* Información de filtros en modo edición */}
                    {announcementId && publicationForm.loadedAnnouncement && (
                        <DestinatariosInfo
                            announcement={publicationForm.loadedAnnouncement}
                            academicYears={academicData.academicYears}
                            academicStages={academicData.academicStages}
                            academicPrograms={academicData.academicPrograms}
                            programYears={academicData.programYears}
                            academicGroups={academicData.academicGroups}
                        />
                    )}

                    {/* Años Académicos - Solo en creación y cuando no es solo USER */}
                    {!announcementId && shouldShowAcademicSelectors && (
                        <AcademicSelector
                            title="Años Académicos"
                            icon="lucide--calendar"
                            items={academicData.academicYears}
                            selected={selections.selectedAcademicYears}
                            onToggle={selections.handleAcademicYearToggle}
                            onSelectAll={(isSelected) =>
                                selections.handleSelectAllAcademicYears(
                                    academicData.academicYears.map(y => y.id),
                                    isSelected
                                )
                            }
                            loading={academicData.loading}
                            error={academicData.error}
                            renderLabel={(year) => year.academic_year_key}
                            emptyMessage="No se encontraron años académicos activos"
                        />
                    )}

                    {/* Niveles Académicos - Solo en creación y cuando no es solo USER */}
                    {!announcementId && isAdmin && shouldShowAcademicSelectors && (
                        <AcademicSelector
                            title="Niveles Académicos"
                            icon="lucide--graduation-cap"
                            items={academicData.academicStages}
                            selected={selections.selectedAcademicStages}
                            onToggle={selections.handleAcademicStageToggle}
                            onSelectAll={(isSelected) =>
                                selections.handleSelectAllAcademicStages(
                                    academicData.academicStages.map(s => s.id),
                                    isSelected
                                )
                            }
                            loading={academicData.loading}
                            error={academicData.error}
                            renderLabel={(stage) => `(${stage.academic_stage_key}) ${stage.description}`}
                            emptyMessage="No se encontraron niveles académicos activos"
                        />
                    )}

                    {/* Selector de Materias - Solo para profesores */}
                    {!announcementId && isTeacher && (
                        <SubjectSelector
                            subjects={teacherSubjects.subjects}
                            selectedSubjects={selectedSubjects}
                            onToggle={handleSubjectToggle}
                            onSelectAll={handleSelectAllSubjects}
                            loading={teacherSubjects.loading}
                            error={teacherSubjects.error}
                        />
                    )}

                    {/* Programas Académicos - Solo si hay stages seleccionados */}
                    {!announcementId && isAdmin && selections.selectedAcademicStages.size > 0 && (
                        <AcademicSelector
                            title="Programas Académicos"
                            icon="lucide--book-open"
                            items={academicData.academicPrograms}
                            selected={selections.selectedAcademicPrograms}
                            onToggle={selections.handleAcademicProgramToggle}
                            onSelectAll={(isSelected) =>
                                selections.handleSelectAllAcademicPrograms(
                                    academicData.academicPrograms.map(p => p.id),
                                    isSelected
                                )
                            }
                            renderLabel={(program) => `(${program.academic_program_key}) ${program.description}`}
                            emptyMessage="No se encontraron programas académicos para los niveles seleccionados"
                        />
                    )}

                    {/* Años de Programa - Solo si hay stages y programs seleccionados */}
                    {!announcementId && selections.selectedAcademicStages.size > 0 && selections.selectedAcademicPrograms.size > 0 && (
                        <AcademicSelector
                            title="Años de Programa"
                            icon="lucide--layers"
                            items={academicData.programYears}
                            selected={selections.selectedProgramYears}
                            onToggle={selections.handleProgramYearToggle}
                            onSelectAll={(isSelected) =>
                                selections.handleSelectAllProgramYears(
                                    academicData.programYears.map(y => y.id),
                                    isSelected
                                )
                            }
                            renderLabel={(year) => `${year.description} (${year.academic_stage.academic_stage_key})`}
                            emptyMessage="No se encontraron años de programa para la combinación seleccionada"
                        />
                    )}

                    {/* Grupos Académicos - Solo si hay program years seleccionados */}
                    {!announcementId && selections.selectedProgramYears.size > 0 && (
                        <AcademicSelector
                            title="Grupos Académicos"
                            icon="lucide--users"
                            items={academicData.academicGroups}
                            selected={selections.selectedAcademicGroups}
                            onToggle={selections.handleAcademicGroupToggle}
                            onSelectAll={(isSelected) =>
                                selections.handleSelectAllAcademicGroups(
                                    academicData.academicGroups.map(g => g.id),
                                    isSelected
                                )
                            }
                            renderLabel={(group) => `${group.label} (${group.academic_stage.academic_stage_key})`}
                            emptyMessage="No se encontraron grupos académicos para los años de programa seleccionados"
                        />
                    )}

                    {/* Tabla de destinatarios */}
                    {selections.selectedRecipientTypes.size > 0 && (
                        <RecipientTable
                            recipients={recipientsData.recipients}
                            selected={selections.selectedRecipients}
                            loading={recipientsData.loading}
                            error={recipientsData.error}
                            onToggle={selections.handleRecipientToggle}
                            onSelectAll={(isSelected) =>
                                selections.handleSelectAllRecipients(
                                    recipientsData.recipients.map(r => r.person_id),
                                    isSelected
                                )
                            }
                            onLoadRecipients={handleLoadRecipients}
                            selectedRecipientTypes={selections.selectedRecipientTypes}
                        />
                    )}

                    {/* Formulario de publicación */}
                    {shouldShowForm && (
                        <PublicationFormCard
                            announcementId={announcementId}
                            publicationType={publicationType}
                            formData={publicationForm.formData}
                            onFieldChange={publicationForm.updateFormField}
                            attachments={publicationForm.attachments}
                            existingAttachments={publicationForm.existingAttachments}
                            onAddAttachment={publicationForm.addAttachment}
                            onRemoveAttachment={publicationForm.removeAttachment}
                            onRemoveExistingAttachment={publicationForm.removeExistingAttachment}
                            onFileUpload={publicationForm.handleFileUpload}
                            onPublish={handlePublish}
                            publishLoading={publicationForm.publishLoading}
                            publishError={publicationForm.publishError}
                            isTeacher={isTeacher}
                        />
                    )}

                    {/* Mensaje cuando no hay elementos seleccionados */}
                    {!academicData.loading &&
                     !academicData.error &&
                     academicData.academicYears.length > 0 &&
                     selections.selectedAcademicYears.size === 0 &&
                     selections.selectedAcademicStages.size === 0 &&
                     !isOnlyUser && (
                        <div className="text-center py-12">
                            <span className="iconify lucide--check-square size-16 text-base-content/30 mb-4"></span>
                            <h3 className="text-lg font-medium text-base-content mb-2">
                                Selecciona años y niveles académicos
                            </h3>
                            <p className="text-base-content/70">
                                Para crear un aviso, selecciona uno o más años académicos y niveles académicos
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicationsApp;
