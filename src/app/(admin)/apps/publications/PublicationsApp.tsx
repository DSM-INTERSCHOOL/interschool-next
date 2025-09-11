"use client";

import { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { IAcademicYear } from "@/interfaces/IAcademicYear";
import { IAcademicStage } from "@/interfaces/IAcademicStage";
import { IAcademicProgram } from "@/interfaces/IAcademicProgram";
import { IProgramYear } from "@/interfaces/IProgramYear";
import { IAcademicGroup } from "@/interfaces/IAcademicGroup";
import { IRecipient, PersonType } from "@/interfaces/IRecipient";
import { getActiveAcademicYears } from "@/services/academic-year.service";
import { getAcademicStagesByPrecedence } from "@/services/academic-stage.service";
import { getAcademicProgramsByStages } from "@/services/academic-program.service";
import { getProgramYearsByStagesAndPrograms } from "@/services/program-year.service";
import { getAcademicGroupsByProgramYears } from "@/services/academic-group.service";
import { getRecipientsWithAcademicFilters } from "@/services/recipient.service";

const PublicationsApp = () => {
    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [selectedAcademicYears, setSelectedAcademicYears] = useState<Set<number>>(new Set());
    const [academicStages, setAcademicStages] = useState<IAcademicStage[]>([]);
    const [selectedAcademicStages, setSelectedAcademicStages] = useState<Set<number>>(new Set());
    const [academicPrograms, setAcademicPrograms] = useState<IAcademicProgram[]>([]);
    const [selectedAcademicPrograms, setSelectedAcademicPrograms] = useState<Set<number>>(new Set());
    const [programYears, setProgramYears] = useState<IProgramYear[]>([]);
    const [selectedProgramYears, setSelectedProgramYears] = useState<Set<number>>(new Set());
    const [academicGroups, setAcademicGroups] = useState<IAcademicGroup[]>([]);
    const [selectedAcademicGroups, setSelectedAcademicGroups] = useState<Set<number>>(new Set());
    const [selectedRecipientTypes, setSelectedRecipientTypes] = useState<Set<string>>(new Set());
    const [recipients, setRecipients] = useState<IRecipient[]>([]);
    const [selectedRecipients, setSelectedRecipients] = useState<Set<number>>(new Set());
    const [recipientsLoading, setRecipientsLoading] = useState(false);
    const [announcementContent, setAnnouncementContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Cargar años académicos y niveles académicos
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Cargar ambos en paralelo
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

    // Cargar programas académicos cuando cambian los stages seleccionados
    useEffect(() => {
        const loadAcademicPrograms = async () => {
            try {
                if (selectedAcademicStages.size > 0) {
                    const stageIds = Array.from(selectedAcademicStages);
                    const programs = await getAcademicProgramsByStages(stageIds);
                    setAcademicPrograms(programs);
                } else {
                    setAcademicPrograms([]);
                    setSelectedAcademicPrograms(new Set());
                }
            } catch (err: any) {
                console.error("Error loading academic programs:", err);
                setAcademicPrograms([]);
            }
        };

        loadAcademicPrograms();
    }, [selectedAcademicStages]);

    // Cargar años de programa cuando cambian los stages y programs seleccionados
    useEffect(() => {
        const loadProgramYears = async () => {
            try {
                if (selectedAcademicStages.size > 0 && selectedAcademicPrograms.size > 0) {
                    const stageIds = Array.from(selectedAcademicStages);
                    const programIds = Array.from(selectedAcademicPrograms);
                    const years = await getProgramYearsByStagesAndPrograms(stageIds, programIds);
                    setProgramYears(years);
                } else {
                    setProgramYears([]);
                    setSelectedProgramYears(new Set());
                }
            } catch (err: any) {
                console.error("Error loading program years:", err);
                setProgramYears([]);
            }
        };

        loadProgramYears();
    }, [selectedAcademicStages, selectedAcademicPrograms]);

    // Cargar grupos académicos cuando cambian los program years seleccionados
    useEffect(() => {
        const loadAcademicGroups = async () => {
            try {
                if (selectedProgramYears.size > 0) {
                    const programYearIds = Array.from(selectedProgramYears);
                    const groups = await getAcademicGroupsByProgramYears(programYearIds);
                    setAcademicGroups(groups);
                } else {
                    setAcademicGroups([]);
                    setSelectedAcademicGroups(new Set());
                }
            } catch (err: any) {
                console.error("Error loading academic groups:", err);
                setAcademicGroups([]);
            }
        };

        loadAcademicGroups();
    }, [selectedProgramYears]);

    // Cargar recipients cuando cambian los filtros
    useEffect(() => {
        const loadRecipients = async () => {
            try {
                if (selectedRecipientTypes.size > 0) {
                    setRecipientsLoading(true);
                    const personTypes = Array.from(selectedRecipientTypes) as PersonType[];
                    
                    // Construir filtros académicos
                    const academicFilters = {
                        academic_years: selectedAcademicYears.size > 0 ? Array.from(selectedAcademicYears) : undefined,
                        academic_stages: selectedAcademicStages.size > 0 ? Array.from(selectedAcademicStages) : undefined,
                        academic_programs: selectedAcademicPrograms.size > 0 ? Array.from(selectedAcademicPrograms) : undefined,
                        program_years: selectedProgramYears.size > 0 ? Array.from(selectedProgramYears) : undefined,
                        academic_groups: selectedAcademicGroups.size > 0 ? Array.from(selectedAcademicGroups) : undefined,
                    };
                    
                    const recipientsData = await getRecipientsWithAcademicFilters(personTypes, academicFilters);
                    setRecipients(recipientsData);
                } else {
                    setRecipients([]);
                    setSelectedRecipients(new Set());
                }
            } catch (err: any) {
                console.error("Error loading recipients:", err);
                setRecipients([]);
            } finally {
                setRecipientsLoading(false);
            }
        };

        loadRecipients();
    }, [selectedRecipientTypes, selectedAcademicYears, selectedAcademicStages, selectedAcademicPrograms, selectedProgramYears, selectedAcademicGroups]);

    const handleAcademicYearToggle = (yearId: number, isSelected: boolean) => {
        setSelectedAcademicYears(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(yearId);
            } else {
                newSet.delete(yearId);
            }
            return newSet;
        });
    };

    const handleSelectAllAcademicYears = (isSelected: boolean) => {
        if (isSelected) {
            const allIds = new Set(academicYears.map(year => year.id));
            setSelectedAcademicYears(allIds);
        } else {
            setSelectedAcademicYears(new Set());
        }
    };

    const handleAcademicStageToggle = (stageId: number, isSelected: boolean) => {
        setSelectedAcademicStages(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(stageId);
            } else {
                newSet.delete(stageId);
            }
            return newSet;
        });
    };

    const handleSelectAllAcademicStages = (isSelected: boolean) => {
        if (isSelected) {
            const allIds = new Set(academicStages.map(stage => stage.id));
            setSelectedAcademicStages(allIds);
        } else {
            setSelectedAcademicStages(new Set());
        }
    };

    const handleAcademicProgramToggle = (programId: number, isSelected: boolean) => {
        setSelectedAcademicPrograms(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(programId);
            } else {
                newSet.delete(programId);
            }
            return newSet;
        });
    };

    const handleSelectAllAcademicPrograms = (isSelected: boolean) => {
        if (isSelected) {
            const allIds = new Set(academicPrograms.map(program => program.id));
            setSelectedAcademicPrograms(allIds);
        } else {
            setSelectedAcademicPrograms(new Set());
        }
    };

    const handleProgramYearToggle = (yearId: number, isSelected: boolean) => {
        setSelectedProgramYears(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(yearId);
            } else {
                newSet.delete(yearId);
            }
            return newSet;
        });
    };

    const handleSelectAllProgramYears = (isSelected: boolean) => {
        if (isSelected) {
            const allIds = new Set(programYears.map(year => year.id));
            setSelectedProgramYears(allIds);
        } else {
            setSelectedProgramYears(new Set());
        }
    };

    const handleAcademicGroupToggle = (groupId: number, isSelected: boolean) => {
        setSelectedAcademicGroups(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(groupId);
            } else {
                newSet.delete(groupId);
            }
            return newSet;
        });
    };

    const handleSelectAllAcademicGroups = (isSelected: boolean) => {
        if (isSelected) {
            const allIds = new Set(academicGroups.map(group => group.id));
            setSelectedAcademicGroups(allIds);
        } else {
            setSelectedAcademicGroups(new Set());
        }
    };

    const handleRecipientTypeToggle = (type: string, isSelected: boolean) => {
        setSelectedRecipientTypes(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(type);
            } else {
                newSet.delete(type);
            }
            return newSet;
        });
    };

    const handleSelectAllRecipientTypes = (isSelected: boolean) => {
        if (isSelected) {
            setSelectedRecipientTypes(new Set(['STUDENT', 'TEACHER', 'USER', 'RELATIVE']));
        } else {
            setSelectedRecipientTypes(new Set());
        }
    };

    const handleRecipientToggle = (personId: number, isSelected: boolean) => {
        setSelectedRecipients(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(personId);
            } else {
                newSet.delete(personId);
            }
            return newSet;
        });
    };

    const handleSelectAllRecipients = (isSelected: boolean) => {
        if (isSelected) {
            const allIds = new Set(recipients.map(recipient => recipient.person_id));
            setSelectedRecipients(allIds);
        } else {
            setSelectedRecipients(new Set());
        }
    };

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
                    {/* Selección de tipos de destinatarios */}
                    <div className="card card-border bg-base-100 shadow-lg">
                        <div className="card-body">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="card-title text-lg">
                                    <span className="iconify lucide--users-2 size-5"></span>
                                    Selecciona Tipo Destinatarios
                                </h3>
                                <div className="text-sm text-base-content/70">
                                    {selectedRecipientTypes.size} de 4 seleccionados
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Checkbox para seleccionar todos */}
                                <div className="flex items-center gap-3 p-3 border border-base-300 rounded-lg bg-base-200">
                                    <label className="label cursor-pointer flex items-center gap-3 p-0">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-primary"
                                            checked={selectedRecipientTypes.size === 4}
                                            onChange={(e) => handleSelectAllRecipientTypes(e.target.checked)}
                                        />
                                        <span className="font-medium text-base-content">
                                            Seleccionar todos los tipos de destinatarios
                                        </span>
                                    </label>
                                </div>

                                {/* Lista de tipos de destinatarios */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {[
                                        { value: 'STUDENT', label: 'Estudiantes', icon: 'lucide--graduation-cap', color: 'primary' },
                                        { value: 'RELATIVE', label: 'Familiares', icon: 'lucide--heart', color: 'success' },
                                        { value: 'TEACHER', label: 'Profesores', icon: 'lucide--user-check', color: 'secondary' },
                                        { value: 'USER', label: 'Usuarios', icon: 'lucide--users', color: 'accent' }
                                    ].map((recipientType) => (
                                        <div 
                                            key={recipientType.value}
                                            className={`card border transition-all duration-200 ${
                                                selectedRecipientTypes.has(recipientType.value) 
                                                    ? `border-${recipientType.color} bg-${recipientType.color}/5` 
                                                    : 'border-base-300 hover:border-base-400'
                                            }`}
                                        >
                                            <div className="card-body p-3">
                                                <div className="form-control">
                                                    <label className="label cursor-pointer p-0 justify-start">
                                                        <input
                                                            type="checkbox"
                                                            className={`checkbox checkbox-${recipientType.color} checkbox-sm mr-3`}
                                                            checked={selectedRecipientTypes.has(recipientType.value)}
                                                            onChange={(e) => handleRecipientTypeToggle(recipientType.value, e.target.checked)}
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <span className={`iconify ${recipientType.icon} size-4 text-${recipientType.color}`}></span>
                                                            <div className="text-sm text-base-content">
                                                                {recipientType.label}
                                                            </div>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Selección de años académicos - Solo mostrar si no es únicamente USER */}
                    {!(selectedRecipientTypes.size === 1 && selectedRecipientTypes.has('USER')) && (
                        <div className="card bg-base-100 shadow-lg">
                        <div className="card-body">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="card-title text-lg">
                                    <span className="iconify lucide--calendar size-5"></span>
                                    Años Académicos
                                </h3>
                                <div className="text-sm text-base-content/70">
                                    {selectedAcademicYears.size} de {academicYears.length} seleccionados
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <LoadingSpinner message="Cargando años académicos..." />
                                </div>
                            ) : error ? (
                                <div className="alert alert-error shadow-lg">
                                    <span className="iconify lucide--alert-circle size-6"></span>
                                    <div>
                                        <h3 className="font-bold">Error</h3>
                                        <div className="text-sm">{error}</div>
                                    </div>
                                </div>
                            ) : academicYears.length === 0 ? (
                                <div className="text-center py-8">
                                    <span className="iconify lucide--calendar-x size-16 text-base-content/30 mb-4"></span>
                                    <p className="text-base-content/70">
                                        No se encontraron años académicos activos
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Checkbox para seleccionar todos */}
                                    <div className="flex items-center gap-3 p-3 border border-base-300 rounded-lg bg-base-200">
                                        <label className="label cursor-pointer flex items-center gap-3 p-0">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-primary"
                                                checked={academicYears.length > 0 && selectedAcademicYears.size === academicYears.length}
                                                onChange={(e) => handleSelectAllAcademicYears(e.target.checked)}
                                            />
                                            <span className="font-medium text-base-content">
                                                Seleccionar todos los años académicos
                                            </span>
                                        </label>
                                    </div>

                                    {/* Lista de años académicos */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                        {academicYears.map((year) => (
                                            <div 
                                                key={year.id}
                                                className={`card border transition-all duration-200 ${
                                                    selectedAcademicYears.has(year.id) 
                                                        ? 'border-primary bg-primary/5' 
                                                        : 'border-base-300 hover:border-base-400'
                                                }`}
                                            >
                                                <div className="card-body p-2">
                                                    <label className="label cursor-pointer p-0 justify-start">
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox checkbox-primary checkbox-sm mr-2"
                                                            checked={selectedAcademicYears.has(year.id)}
                                                            onChange={(e) => handleAcademicYearToggle(year.id, e.target.checked)}
                                                        />
                                                        <div className="flex-1">
                                                            <div className="text-xs text-base-content">
                                                                {year.academic_year_key}
                                                            </div>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    )}

                    {/* Todas las secciones académicas - Solo mostrar si no es únicamente USER */}
                    {!(selectedRecipientTypes.size === 1 && selectedRecipientTypes.has('USER')) && (
                    <>
                    {/* Selección de niveles académicos */}
                    <div className="card bg-base-100 shadow-lg">
                        <div className="card-body">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="card-title text-lg">
                                    <span className="iconify lucide--graduation-cap size-5"></span>
                                    Niveles Académicos
                                </h3>
                                <div className="text-sm text-base-content/70">
                                    {selectedAcademicStages.size} de {academicStages.length} seleccionados
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <LoadingSpinner message="Cargando niveles académicos..." />
                                </div>
                            ) : error ? (
                                <div className="alert alert-error shadow-lg">
                                    <span className="iconify lucide--alert-circle size-6"></span>
                                    <div>
                                        <h3 className="font-bold">Error</h3>
                                        <div className="text-sm">{error}</div>
                                    </div>
                                </div>
                            ) : academicStages.length === 0 ? (
                                <div className="text-center py-8">
                                    <span className="iconify lucide--graduation-cap size-16 text-base-content/30 mb-4"></span>
                                    <p className="text-base-content/70">
                                        No se encontraron niveles académicos activos
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Checkbox para seleccionar todos */}
                                    <div className="flex items-center gap-3 p-3 border border-base-300 rounded-lg bg-base-200">
                                        <label className="label cursor-pointer flex items-center gap-3 p-0">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-primary"
                                                checked={academicStages.length > 0 && selectedAcademicStages.size === academicStages.length}
                                                onChange={(e) => handleSelectAllAcademicStages(e.target.checked)}
                                            />
                                            <span className="font-medium text-base-content">
                                                Seleccionar todos los niveles académicos
                                            </span>
                                        </label>
                                    </div>

                                    {/* Lista de niveles académicos */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                        {academicStages.map((stage) => (
                                            <div 
                                                key={stage.id}
                                                className={`card border transition-all duration-200 ${
                                                    selectedAcademicStages.has(stage.id) 
                                                        ? 'border-primary bg-primary/5' 
                                                        : 'border-base-300 hover:border-base-400'
                                                }`}
                                            >
                                                <div className="card-body p-2">
                                                    <label className="label cursor-pointer p-0 justify-start">
                                                        <input
                                                            type="checkbox"
                                                            className="checkbox checkbox-primary checkbox-sm mr-2"
                                                            checked={selectedAcademicStages.has(stage.id)}
                                                            onChange={(e) => handleAcademicStageToggle(stage.id, e.target.checked)}
                                                        />
                                                        <div className="flex-1">
                                                            <div className="text-xs text-base-content">
                                                                ({stage.academic_stage_key}) {stage.description}
                                                            </div>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Selección de programas académicos (solo si hay stages seleccionados) */}
                    {selectedAcademicStages.size > 0 && (
                        <div className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="card-title text-lg">
                                        <span className="iconify lucide--book-open size-5"></span>
                                        Programas Académicos
                                    </h3>
                                    <div className="text-sm text-base-content/70">
                                        {selectedAcademicPrograms.size} de {academicPrograms.length} seleccionados
                                    </div>
                                </div>

                                {academicPrograms.length === 0 ? (
                                    <div className="text-center py-8">
                                        <span className="iconify lucide--book-open size-16 text-base-content/30 mb-4"></span>
                                        <p className="text-base-content/70">
                                            No se encontraron programas académicos para los niveles seleccionados
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Checkbox para seleccionar todos */}
                                        <div className="flex items-center gap-3 p-3 border border-base-300 rounded-lg bg-base-200">
                                            <label className="label cursor-pointer flex items-center gap-3 p-0">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox checkbox-primary"
                                                    checked={academicPrograms.length > 0 && selectedAcademicPrograms.size === academicPrograms.length}
                                                    onChange={(e) => handleSelectAllAcademicPrograms(e.target.checked)}
                                                />
                                                <span className="font-medium text-base-content">
                                                    Seleccionar todos los programas académicos
                                                </span>
                                            </label>
                                        </div>

                                        {/* Lista de programas académicos */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                            {academicPrograms.map((program) => (
                                                <div 
                                                    key={program.id}
                                                    className={`card border transition-all duration-200 ${
                                                        selectedAcademicPrograms.has(program.id) 
                                                            ? 'border-primary bg-primary/5' 
                                                            : 'border-base-300 hover:border-base-400'
                                                    }`}
                                                >
                                                    <div className="card-body p-2">
                                                        <label className="label cursor-pointer p-0 justify-start">
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox checkbox-primary checkbox-sm mr-2"
                                                                checked={selectedAcademicPrograms.has(program.id)}
                                                                onChange={(e) => handleAcademicProgramToggle(program.id, e.target.checked)}
                                                            />
                                                            <div className="flex-1">
                                                                <div className="text-xs text-base-content">
                                                                    ({program.academic_program_key}) {program.description}
                                                                </div>
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Selección de años de programa (solo si hay stages y programs seleccionados) */}
                    {selectedAcademicStages.size > 0 && selectedAcademicPrograms.size > 0 && (
                        <div className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="card-title text-lg">
                                        <span className="iconify lucide--layers size-5"></span>
                                        Años de Programa
                                    </h3>
                                    <div className="text-sm text-base-content/70">
                                        {selectedProgramYears.size} de {programYears.length} seleccionados
                                    </div>
                                </div>

                                {programYears.length === 0 ? (
                                    <div className="text-center py-8">
                                        <span className="iconify lucide--layers size-16 text-base-content/30 mb-4"></span>
                                        <p className="text-base-content/70">
                                            No se encontraron años de programa para la combinación seleccionada
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Checkbox para seleccionar todos */}
                                        <div className="flex items-center gap-3 p-3 border border-base-300 rounded-lg bg-base-200">
                                            <label className="label cursor-pointer flex items-center gap-3 p-0">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox checkbox-primary"
                                                    checked={programYears.length > 0 && selectedProgramYears.size === programYears.length}
                                                    onChange={(e) => handleSelectAllProgramYears(e.target.checked)}
                                                />
                                                <span className="font-medium text-base-content">
                                                    Seleccionar todos los años de programa
                                                </span>
                                            </label>
                                        </div>

                                        {/* Lista de años de programa */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                            {programYears.map((year) => (
                                                <div 
                                                    key={year.id}
                                                    className={`card border transition-all duration-200 ${
                                                        selectedProgramYears.has(year.id) 
                                                            ? 'border-primary bg-primary/5' 
                                                            : 'border-base-300 hover:border-base-400'
                                                    }`}
                                                >
                                                    <div className="card-body p-2">
                                                        <label className="label cursor-pointer p-0 justify-start">
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox checkbox-primary checkbox-sm mr-2"
                                                                checked={selectedProgramYears.has(year.id)}
                                                                onChange={(e) => handleProgramYearToggle(year.id, e.target.checked)}
                                                            />
                                                            <div className="flex-1">
                                                                <div className="text-xs text-base-content">
                                                                    {year.description}
                                                                </div>
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Selección de grupos académicos (solo si hay program years seleccionados) */}
                    {selectedProgramYears.size > 0 && (
                        <div className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="card-title text-lg">
                                        <span className="iconify lucide--users size-5"></span>
                                        Grupos Académicos
                                    </h3>
                                    <div className="text-sm text-base-content/70">
                                        {selectedAcademicGroups.size} de {academicGroups.length} seleccionados
                                    </div>
                                </div>

                                {academicGroups.length === 0 ? (
                                    <div className="text-center py-8">
                                        <span className="iconify lucide--users size-16 text-base-content/30 mb-4"></span>
                                        <p className="text-base-content/70">
                                            No se encontraron grupos académicos para los años de programa seleccionados
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Checkbox para seleccionar todos */}
                                        <div className="flex items-center gap-3 p-3 border border-base-300 rounded-lg bg-base-200">
                                            <label className="label cursor-pointer flex items-center gap-3 p-0">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox checkbox-primary"
                                                    checked={academicGroups.length > 0 && selectedAcademicGroups.size === academicGroups.length}
                                                    onChange={(e) => handleSelectAllAcademicGroups(e.target.checked)}
                                                />
                                                <span className="font-medium text-base-content">
                                                    Seleccionar todos los grupos académicos
                                                </span>
                                            </label>
                                        </div>

                                        {/* Lista de grupos académicos */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                            {academicGroups.map((group) => (
                                                <div 
                                                    key={group.id}
                                                    className={`card border transition-all duration-200 ${
                                                        selectedAcademicGroups.has(group.id) 
                                                            ? 'border-primary bg-primary/5' 
                                                            : 'border-base-300 hover:border-base-400'
                                                    }`}
                                                >
                                                    <div className="card-body p-2">
                                                        <label className="label cursor-pointer p-0 justify-start">
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox checkbox-primary checkbox-sm mr-2"
                                                                checked={selectedAcademicGroups.has(group.id)}
                                                                onChange={(e) => handleAcademicGroupToggle(group.id, e.target.checked)}
                                                            />
                                                            <div className="flex-1">
                                                                <div className="text-xs text-base-content">
                                                                    {group.label}
                                                                </div>
                                                            </div>
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    </>
                    )}

                    {/* Sección de Recipients (solo si hay tipos de destinatarios seleccionados) */}
                    {selectedRecipientTypes.size > 0 && (
                        <div className="card card-border bg-base-100 shadow-lg">
                            <div className="card-body">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="card-title text-lg">
                                        <span className="iconify lucide--users size-5"></span>
                                        Destinatarios
                                    </h3>
                                    <div className="text-sm text-base-content/70">
                                        {selectedRecipients.size} de {recipients.length} seleccionados
                                    </div>
                                </div>

                                {recipientsLoading ? (
                                    <div className="flex justify-center py-8">
                                        <LoadingSpinner message="Cargando destinatarios..." />
                                    </div>
                                ) : recipients.length === 0 ? (
                                    <div className="text-center py-8">
                                        <span className="iconify lucide--users size-16 text-base-content/30 mb-4"></span>
                                        <p className="text-base-content/70">
                                            No se encontraron destinatarios para los filtros seleccionados
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Checkbox para seleccionar todos */}
                                        <div className="flex items-center gap-3 p-3 border border-base-300 rounded-lg bg-base-200">
                                            <label className="label cursor-pointer flex items-center gap-3 p-0">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox checkbox-primary"
                                                    checked={recipients.length > 0 && selectedRecipients.size === recipients.length}
                                                    onChange={(e) => handleSelectAllRecipients(e.target.checked)}
                                                />
                                                <span className="font-medium text-base-content">
                                                    Seleccionar todos los destinatarios
                                                </span>
                                            </label>
                                        </div>

                                        {/* Tabla de destinatarios */}
                                        <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
                                            <table className="table table-zebra">
                                                <thead className="sticky top-0 bg-base-100 z-10">
                                                    <tr>
                                                        <th>
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox checkbox-primary"
                                                                checked={recipients.length > 0 && selectedRecipients.size === recipients.length}
                                                                onChange={(e) => handleSelectAllRecipients(e.target.checked)}
                                                            />
                                                        </th>
                                                        <th>ID</th>
                                                        <th>Nombre Completo</th>
                                                        <th>Tipo</th>
                                                        <th>Año Académico</th>
                                                        <th>Nivel</th>
                                                        <th>Programa</th>
                                                        <th>Año Programa</th>
                                                        <th>Grupo</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {recipients.map((recipient) => (
                                                        <tr 
                                                            key={recipient.person_id}
                                                            className={`hover:bg-base-200 cursor-pointer ${
                                                                selectedRecipients.has(recipient.person_id) 
                                                                    ? 'bg-primary/5 border-primary/20' 
                                                                    : ''
                                                            }`}
                                                            onClick={() => handleRecipientToggle(
                                                                recipient.person_id, 
                                                                !selectedRecipients.has(recipient.person_id)
                                                            )}
                                                        >
                                                            <td>
                                                                <input
                                                                    type="checkbox"
                                                                    className="checkbox checkbox-primary checkbox-sm"
                                                                    checked={selectedRecipients.has(recipient.person_id)}
                                                                    onChange={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRecipientToggle(recipient.person_id, e.target.checked);
                                                                    }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <div className="font-mono text-xs">
                                                                    {recipient.person_internal_id}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="font-medium">
                                                                    {recipient.full_name}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className={`badge badge-sm ${
                                                                    recipient.person_type === 'STUDENT' ? 'badge-primary' :
                                                                    recipient.person_type === 'TEACHER' ? 'badge-secondary' :
                                                                    recipient.person_type === 'USER' ? 'badge-accent' :
                                                                    'badge-success'
                                                                }`}>
                                                                    {recipient.person_type === 'STUDENT' ? 'Estudiante' :
                                                                     recipient.person_type === 'TEACHER' ? 'Profesor' :
                                                                     recipient.person_type === 'USER' ? 'Usuario' :
                                                                     'Familiar'}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className="text-sm text-base-content/70">
                                                                    {recipient.academic_year_key || '-'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className="text-sm text-base-content/70">
                                                                    {recipient.academic_stage_key || '-'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className="text-sm text-base-content/70">
                                                                    {recipient.academic_program_key || '-'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className="text-sm text-base-content/70">
                                                                    {recipient.program_year_key || '-'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className="text-sm text-base-content/70">
                                                                    {recipient.academic_group_key || '-'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Paginación si hay muchos resultados */}
                                        {recipients.length > 50 && (
                                            <div className="flex justify-center mt-4">
                                                <div className="text-sm text-base-content/70">
                                                    Mostrando {recipients.length} destinatarios
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Formulario para crear aviso (aparece cuando se seleccionan años académicos o solo USER) */}
                    {(selectedAcademicYears.size > 0 || selectedAcademicStages.size > 0 || (selectedRecipientTypes.size === 1 && selectedRecipientTypes.has('USER'))) && (
                        <div className="card card-border bg-base-100 shadow-xl">
                            <div className="card-body">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <span className="iconify lucide--megaphone size-6 text-primary"></span>
                                    </div>
                                    <div>
                                        <h3 className="card-title text-xl text-base-content">
                                            Crear Nuevo Aviso
                                        </h3>
                                        <p className="text-sm text-base-content/60">
                                            Publica información importante para la comunidad educativa
                                        </p>
                                    </div>
                                </div>

                                {/* Resumen de selecciones */}
                                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <span className="iconify lucide--info size-5 text-primary mt-0.5"></span>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-base-content mb-2">Alcance del Aviso</h4>
                                            {(selectedRecipientTypes.size === 1 && selectedRecipientTypes.has('USER')) ? (
                                                // Solo mostrar destinatarios cuando es únicamente USER
                                                <div className="grid grid-cols-1 gap-3 text-sm">
                                                    <div className="bg-base-100 rounded-lg p-4 text-center">
                                                        <div className="font-semibold text-warning text-lg">{selectedRecipientTypes.size}</div>
                                                        <div className="text-sm text-base-content/70">Tipo de Destinatario Seleccionado</div>
                                                        <div className="text-xs text-base-content/50 mt-1">El aviso será enviado a todos los usuarios del sistema</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                // Mostrar todos los contadores cuando hay filtros académicos
                                                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                                                    <div className="bg-base-100 rounded-lg p-2 text-center">
                                                        <div className="font-semibold text-warning">{selectedRecipientTypes.size}</div>
                                                        <div className="text-xs text-base-content/70">Destinatarios</div>
                                                    </div>
                                                    <div className="bg-base-100 rounded-lg p-2 text-center">
                                                        <div className="font-semibold text-primary">{selectedAcademicYears.size}</div>
                                                        <div className="text-xs text-base-content/70">Años Académicos</div>
                                                    </div>
                                                    <div className="bg-base-100 rounded-lg p-2 text-center">
                                                        <div className="font-semibold text-secondary">{selectedAcademicStages.size}</div>
                                                        <div className="text-xs text-base-content/70">Niveles</div>
                                                    </div>
                                                    <div className="bg-base-100 rounded-lg p-2 text-center">
                                                        <div className="font-semibold text-accent">{selectedAcademicPrograms.size}</div>
                                                        <div className="text-xs text-base-content/70">Programas</div>
                                                    </div>
                                                    <div className="bg-base-100 rounded-lg p-2 text-center">
                                                        <div className="font-semibold text-info">{selectedProgramYears.size}</div>
                                                        <div className="text-xs text-base-content/70">Años Programa</div>
                                                    </div>
                                                    <div className="bg-base-100 rounded-lg p-2 text-center">
                                                        <div className="font-semibold text-success">{selectedAcademicGroups.size}</div>
                                                        <div className="text-xs text-base-content/70">Grupos</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Formulario */}
                                <div className="space-y-6">
                                    {/* Título */}
                                    <fieldset className="fieldset w-full">
                                        <legend className="fieldset-legend flex items-center gap-2">
                                            <span className="iconify lucide--type size-4"></span>
                                            Título del Aviso
                                        </legend>
                                        <label className="input input-primary w-full">
                                            <span className="iconify lucide--edit-3 text-base-content/60 size-5"></span>
                                            <input 
                                                className="grow w-full" 
                                                type="text" 
                                                placeholder="Ej: Reunión de padres de familia, Suspensión de clases..."
                                            />
                                        </label>
                                        <p className="fieldset-label">* Campo requerido</p>
                                    </fieldset>

                                    {/* Contenido */}
                                    <fieldset className="fieldset w-full">
                                        <legend className="fieldset-legend flex items-center gap-2">
                                            <span className="iconify lucide--file-text size-4"></span>
                                            Contenido del Aviso
                                        </legend>
                                        <div className="w-full">
                                            <Editor
                                                apiKey="a8bvz8ljrja6c147qm0xdh4nplqv7pmodepk5gnc6pgnx0ci"
                                                init={{
                                                    height: 600,
                                                    menubar: false,
                                                    plugins: [
                                                        'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                                                        'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                                                        'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                                                    ],
                                                    toolbar: 'undo redo | blocks | ' +
                                                        'bold italic forecolor | alignleft aligncenter ' +
                                                        'alignright alignjustify | bullist numlist outdent indent | ' +
                                                        'image link | removeformat | help',
                                                    content_style: `
                                                        body { 
                                                            font-family: ui-sans-serif, system-ui, sans-serif; 
                                                            font-size: 14px;
                                                            line-height: 1.6;
                                                        }
                                                    `,
                                                    placeholder: 'Describe los detalles del aviso. Incluye fechas, horarios, ubicaciones y cualquier información relevante...',
                                                    branding: false,
                                                    resize: false,
                                                    statusbar: false,
                                                    // Configuración para subida de imágenes
                                                    images_upload_handler: (blobInfo: any, progress: any) => new Promise((resolve, reject) => {
                                                        const reader = new FileReader();
                                                        reader.onload = () => {
                                                            // Convertir la imagen a base64 data URL
                                                            resolve(reader.result as string);
                                                        };
                                                        reader.onerror = () => {
                                                            reject('Error al procesar la imagen');
                                                        };
                                                        reader.readAsDataURL(blobInfo.blob());
                                                    }),
                                                    // Permitir pegar imágenes
                                                    paste_data_images: true,
                                                    // Mostrar el diálogo de subida de archivos
                                                    file_picker_types: 'image',
                                                    file_picker_callback: (callback: any, value: any, meta: any) => {
                                                        if (meta.filetype === 'image') {
                                                            const input = document.createElement('input');
                                                            input.setAttribute('type', 'file');
                                                            input.setAttribute('accept', 'image/*');
                                                            input.addEventListener('change', (e: any) => {
                                                                const file = e.target.files[0];
                                                                const reader = new FileReader();
                                                                reader.addEventListener('load', () => {
                                                                    callback(reader.result, {
                                                                        alt: file.name
                                                                    });
                                                                });
                                                                reader.readAsDataURL(file);
                                                            });
                                                            input.click();
                                                        }
                                                    },
                                                }}
                                                value={announcementContent}
                                                onEditorChange={(content) => setAnnouncementContent(content)}
                                            />
                                        </div>
                                        <p className="fieldset-label">Usa las herramientas del editor para dar formato a tu aviso</p>
                                    </fieldset>

                                    {/* Fechas */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend flex items-center gap-2">
                                                <span className="iconify lucide--calendar size-4"></span>
                                                Fecha de Inicio
                                            </legend>
                                            <label className="input input-success">
                                                <span className="iconify lucide--calendar-days text-base-content/60 size-5"></span>
                                                <input 
                                                    className="grow" 
                                                    type="date" 
                                                />
                                            </label>
                                            <p className="fieldset-label">Cuándo inicia la vigencia</p>
                                        </fieldset>

                                        <fieldset className="fieldset">
                                            <legend className="fieldset-legend flex items-center gap-2">
                                                <span className="iconify lucide--calendar-x size-4"></span>
                                                Fecha de Fin
                                            </legend>
                                            <label className="input input-warning">
                                                <span className="iconify lucide--calendar-clock text-base-content/60 size-5"></span>
                                                <input 
                                                    className="grow" 
                                                    type="date" 
                                                />
                                            </label>
                                            <p className="fieldset-label">Cuándo expira el aviso</p>
                                        </fieldset>
                                    </div>

                                    {/* Opciones adicionales */}
                                    <div className="bg-base-200 rounded-xl p-4">
                                        <h4 className="font-medium text-base-content mb-3 flex items-center gap-2">
                                            <span className="iconify lucide--settings size-4"></span>
                                            Configuración Adicional
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="form-control bg-base-100 rounded-lg p-3">
                                                <label className="label cursor-pointer flex">
                                                    <div className="flex items-center gap-3">
                                                        <span className="iconify lucide--message-circle size-5 text-accent"></span>
                                                        <div>
                                                            <span className="label-text font-medium">Permitir comentarios</span>
                                                            <div className="text-xs text-base-content/60">Los usuarios podrán comentar en este aviso</div>
                                                        </div>
                                                    </div>
                                                    <input type="checkbox" className="checkbox checkbox-accent" />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div className="flex justify-end mt-8 pt-6 border-t border-base-300">
                                    <button 
                                        className="btn btn-primary"
                                        onClick={() => {
                                            // Aquí se implementará la lógica para publicar el aviso
                                            console.log('Contenido del aviso:', announcementContent);
                                        }}
                                    >
                                        <span className="iconify lucide--send size-4"></span>
                                        Publicar Aviso
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mensaje cuando no hay elementos seleccionados */}
                    {!loading && !error && academicYears.length > 0 && selectedAcademicYears.size === 0 && selectedAcademicStages.size === 0 && (
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