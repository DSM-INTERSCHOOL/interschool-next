"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export const LoginAuth = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState("");
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        person_id: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // Limpiar errores de login cuando el usuario empiece a escribir
        if (loginError) {
            setLoginError('');
        }
        
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        if (isLoading) return;
        
        // Limpiar errores previos
        setLoginError('');
        
        // Validar que los campos no estén vacíos
        if (!formData.person_id) {
            setLoginError('El ID de usuario es requerido');
            return;
        }

        if (!formData.password) {
            setLoginError('La contraseña es requerida');
            return;
        }
        
        setIsLoading(true);
        try {
            const result = await login(formData.person_id, formData.password);
            
            if (result.success) {
                // Redirigir a la página original o al dashboard
                const redirectTo = searchParams.get('redirectTo') || '/dashboards/ecommerce';
                router.push(redirectTo);
            } else {
                setLoginError(result.message || 'Error al iniciar sesión');
            }
        } catch (error: any) {
            console.error("Error en login:", error);
            setLoginError('Hubo un problema. Intenta más tarde');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Error Box Elegante */}
            {loginError && (
                <div className="alert alert-error mb-4 shadow-lg">
                    <div className="flex items-center gap-3">
                        <span className="iconify lucide--alert-circle size-6"></span>
                        <div>
                            <h3 className="font-bold">Error de autenticación</h3>
                            <div className="text-sm opacity-90">{loginError}</div>
                        </div>
                    </div>
                    <button 
                        className="btn btn-sm btn-ghost btn-circle"
                        onClick={() => setLoginError('')}
                        aria-label="Cerrar error"
                    >
                        <span className="iconify lucide--x size-4"></span>
                    </button>
                </div>
            )}

            <fieldset className="fieldset">
                <legend className="fieldset-legend">ID de Usuario</legend>
                <label className="input w-full focus:outline-0">
                    <span className="iconify lucide--user text-base-content/80 size-5"></span>
                    <input
                        value={formData.person_id}
                        name="person_id"
                        onChange={handleChange}
                        onKeyPress={handleKeyPress}
                        className="grow focus:outline-0"
                        placeholder="ID de Usuario"
                        type="text"
                        disabled={isLoading}
                    />
                </label>
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Contraseña</legend>
                <label className="input w-full focus:outline-0">
                    <span className="iconify lucide--key-round text-base-content/80 size-5"></span>
                    <input
                        name="password"
                        onChange={handleChange}
                        onKeyPress={handleKeyPress}
                        className="grow focus:outline-0"
                        placeholder="Contraseña"
                        value={formData.password}
                        type={showPassword ? "text" : "password"}
                        disabled={isLoading}
                    />
                    <button
                        className="btn btn-xs btn-ghost btn-circle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Mostrar/Ocultar contraseña">
                        {showPassword ? (
                            <span className="iconify lucide--eye-off size-4" />
                        ) : (
                            <span className="iconify lucide--eye size-4" />
                        )}
                    </button>
                </label>
            </fieldset>

            <button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="btn btn-primary btn-wide mt-4 max-w-full gap-3 md:mt-6"
            >
                {isLoading ? (
                    <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Iniciando sesión...
                    </>
                ) : (
                    <>
                        <span className="iconify lucide--log-in size-4" />
                        Iniciar Sesión
                    </>
                )}
            </button>
        </>
    );
};
