"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { getStudentPermissions, type AlumnoInfo } from '@/services/auth.service';

const SelectStudentAuthContent = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [alumnos, setAlumnos] = useState<AlumnoInfo[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<string>("");
    const router = useRouter();
    const setAuthData = useAuthStore((state) => state.setAuthData);
    const studentSelectionData = useAuthStore((state) => state.studentSelectionData);

    useEffect(() => {
        // Verificar que tenemos datos de selección de alumno
        if (!studentSelectionData || !studentSelectionData.meta_data?.alumnos) {
            setError("No hay datos de selección de alumno");
            router.push('/auth/login');
            return;
        }

        setAlumnos(studentSelectionData.meta_data.alumnos);
    }, [studentSelectionData, router]);

    const handleSelectStudent = async () => {
        if (!selectedStudent) {
            setError("Por favor selecciona un alumno");
            return;
        }

        // Verificar que tenemos el token del familiar
        const token = studentSelectionData?.token;
        if (!token) {
            setError("No se encontró el token de autenticación");
            return;
        }

        // Obtener la URL legacy de meta_data.baseUrl
        const legacyUrl = studentSelectionData?.meta_data?.baseUrl;
        if (!legacyUrl) {
            setError("No se encontró la URL del sistema legacy");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            // Obtener las cookies del login inicial
            const cookies = studentSelectionData?.cookies;

            // Obtener permisos del estudiante seleccionado
            const permisosResponse = await getStudentPermissions(
                selectedStudent,
                token,
                legacyUrl,
                cookies
            );

            // Actualizar el store con los datos completos del alumno
            setAuthData(permisosResponse);

            // Esperar un momento para que Zustand persista el estado antes de redirigir
            await new Promise(resolve => setTimeout(resolve, 100));

            // Redirigir al home
            router.push('/home');
        } catch (err: any) {
            console.error("Error al obtener permisos del estudiante:", err);
            setError(err.message || 'Error al obtener permisos del estudiante');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        // Limpiar datos y volver al login
        useAuthStore.getState().clearStudentSelection();
        router.push('/auth/login');
    };

    if (!alumnos || alumnos.length === 0) {
        return (
            <div className="flex flex-col items-center gap-4">
                <span className="loading loading-spinner loading-lg"></span>
                <p>Cargando...</p>
            </div>
        );
    }

    return (
        <>
           
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold mb-2">Selecciona un Alumno</h2>
                <p className="text-base-content/70">
                    Por favor selecciona el alumno para el cual deseas ver el portal
                </p>
            </div>

            <div className="space-y-3">
                {alumnos.map((alumnoObj, index) => {
                    // Cada objeto tiene un solo key-value pair
                    const studentId = Object.keys(alumnoObj)[0];
                    const studentName = alumnoObj[studentId];

                    return (
                        <label
                            key={studentId || index}
                            className={`
                                flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer
                                transition-all duration-200
                                ${selectedStudent === studentId
                                    ? 'border-primary bg-primary/10'
                                    : 'border-base-300 hover:border-primary/50 hover:bg-base-200'
                                }
                            `}
                        >
                            <input
                                type="radio"
                                name="student"
                                value={studentId}
                                checked={selectedStudent === studentId}
                                onChange={(e) => setSelectedStudent(e.target.value)}
                                className="radio radio-primary"
                                disabled={isLoading}
                            />
                            <div className="flex-1">
                                <div className="font-semibold">{studentName}</div>
                                <div className="text-sm text-base-content/60">ID: {studentId}</div>
                            </div>
                            <span className="iconify lucide--user size-6 text-base-content/40"></span>
                        </label>
                    );
                })}
            </div>

            <div className="flex gap-3 mt-6">
                <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="btn btn-outline flex-1"
                >
                    <span className="iconify lucide--arrow-left size-4" />
                    Cancelar
                </button>
                <button
                    onClick={handleSelectStudent}
                    disabled={isLoading || !selectedStudent}
                    className="btn btn-primary flex-1"
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Cargando...
                        </>
                    ) : (
                        <>
                            <span className="iconify lucide--check size-4" />
                            Continuar
                        </>
                    )}
                </button>
            </div>
        </>
    );
};

export const SelectStudentAuth = () => {
    return (
        <Suspense fallback={<div className="loading loading-spinner loading-lg"></div>}>
            <SelectStudentAuthContent />
        </Suspense>
    );
};
