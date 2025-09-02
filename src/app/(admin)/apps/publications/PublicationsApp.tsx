"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { IAcademicYear } from "@/interfaces/IAcademicYear";
import { IAcademicStage } from "@/interfaces/IAcademicStage";
import { getActiveAcademicYears } from "@/services/academic-year.service";
import { getAcademicStagesByPrecedence } from "@/services/academic-stage.service";

const PublicationsApp = () => {
    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [selectedAcademicYears, setSelectedAcademicYears] = useState<Set<number>>(new Set());
    const [academicStages, setAcademicStages] = useState<IAcademicStage[]>([]);
    const [selectedAcademicStages, setSelectedAcademicStages] = useState<Set<number>>(new Set());
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

                    {/* Formulario para crear aviso (aparece cuando se seleccionan años académicos) */}
                    {(selectedAcademicYears.size > 0 || selectedAcademicStages.size > 0) && (
                        <div className="card bg-base-100 shadow-lg">
                            <div className="card-body">
                                <h3 className="card-title text-lg">
                                    <span className="iconify lucide--megaphone size-5"></span>
                                    Crear Aviso
                                </h3>
                                <p className="text-base-content/70 mb-4">
                                    El aviso se publicará para {selectedAcademicYears.size} año(s) académico(s) y {selectedAcademicStages.size} nivel(es) académico(s) seleccionados
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