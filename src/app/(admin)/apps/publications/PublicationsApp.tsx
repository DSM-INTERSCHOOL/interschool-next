"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
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
                    {/* Selección de años académicos */}
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
                                                                {stage.description}
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
                                                                    {program.description}
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

                    {/* Formulario para crear aviso (aparece cuando se seleccionan años académicos) */}
                    {(selectedAcademicYears.size > 0 || selectedAcademicStages.size > 0) && (
                        <div className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <h3 className="card-title text-lg">
                                    <span className="iconify lucide--megaphone size-5"></span>
                                    Crear Aviso
                                </h3>
                                <p className="text-base-content/70 mb-4">
                                    El aviso se publicará para {selectedAcademicYears.size} año(s) académico(s), {selectedAcademicStages.size} nivel(es) académico(s), {selectedAcademicPrograms.size} programa(s) académico(s), {selectedProgramYears.size} año(s) de programa y {selectedAcademicGroups.size} grupo(s) académico(s) seleccionados
                                </p>
                                
                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text">Título del Aviso</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="Ingresa el título del aviso..." 
                                        className="input input-bordered w-full" 
                                    />
                                </div>

                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text">Contenido</span>
                                    </label>
                                    <textarea 
                                        className="textarea textarea-bordered h-32" 
                                        placeholder="Escribe el contenido del aviso..."
                                    ></textarea>
                                </div>

                                <div className="flex gap-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Fecha de Inicio</span>
                                        </label>
                                        <input 
                                            type="date" 
                                            className="input input-bordered" 
                                        />
                                    </div>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Fecha de Fin</span>
                                        </label>
                                        <input 
                                            type="date" 
                                            className="input input-bordered" 
                                        />
                                    </div>
                                </div>

                                <div className="form-control mt-4">
                                    <label className="label cursor-pointer justify-start">
                                        <input type="checkbox" className="checkbox checkbox-primary mr-3" />
                                        <span className="label-text">Permitir comentarios</span>
                                    </label>
                                </div>

                                <div className="card-actions justify-end mt-6">
                                    <button 
                                        className="btn btn-outline"
                                        onClick={() => {
                                            setSelectedAcademicYears(new Set());
                                            setSelectedAcademicStages(new Set());
                                            setSelectedAcademicPrograms(new Set());
                                            setSelectedProgramYears(new Set());
                                            setSelectedAcademicGroups(new Set());
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                    <button className="btn btn-primary">
                                        <span className="iconify lucide--send size-4"></span>
                                        Crear Aviso
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