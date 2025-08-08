"use client";

import axios from "axios";
import Link from "next/link";
import React, { useState } from "react";
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';



export const LoginAuth = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState("");
    const setPermisos = useAuthStore((state) => state.setPermisos);
    const router = useRouter();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e: any) => {
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
        if (isLoading) return; // Prevenir múltiples envíos
        
        // Limpiar errores previos
        setLoginError('');
        
        // Validar que los campos no estén vacíos
        if (!formData.email) {
            setLoginError('El usuario es requerido');
            return;
        }

        if (!formData.password) {
            setLoginError('La contraseña es requerida');
            return;
        }
        
        setIsLoading(true);
        try {
            const res = await axios.post(
                "http://core-api.idsm.xyz:8090/web-login",
                {
                    person_id: formData.email,
                    password: formData.password,
                },
                {
                    headers: {
                        "x-device-id": "mobile-web-client",
                        "x-url-origin": "https://admin.celta.interschool.mx",
                    },
                },
            );
            setPermisos(res.data.meta_data.permisos);
            router.push('/dashboards/ecommerce');
        } catch (error: any) {
            console.log("error", error);
            // Manejar diferentes tipos de errores
            if (error.response?.status === 401) {
                setLoginError('Credenciales incorrectas. Verifica tu email y contraseña.');
            } else if (error.response?.status >= 500) {
                setLoginError('Error del servidor. Intenta nuevamente más tarde.');
            } else if (error.code === 'NETWORK_ERROR' || !error.response) {
                setLoginError('Error de conexión. Verifica tu conexión a internet.');
            } else {
                setLoginError('Error al iniciar sesión. Intenta nuevamente.');
            }
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
                <legend className="fieldset-legend">Usuario</legend>
                <label className="input w-full focus:outline-0">
                    <span className="iconify lucide--user text-base-content/80 size-5"></span>
                    <input
                        value={formData.email}
                        name="email"
                        onChange={handleChange}
                        onKeyPress={handleKeyPress}
                        className="grow focus:outline-0"
                        placeholder="Usuario"
                        type="text"
                        disabled={isLoading}
                    />
                </label>
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Password</legend>
                <label className="input w-full focus:outline-0">
                    <span className="iconify lucide--key-round text-base-content/80 size-5"></span>
                    <input
                        name="password"
                        onChange={handleChange}
                        onKeyPress={handleKeyPress}
                        className="grow focus:outline-0"
                        placeholder="Password"
                        value={formData.password}
                        type={showPassword ? "text" : "password"}
                        disabled={isLoading}
                    />
                    <button
                        className="btn btn-xs btn-ghost btn-circle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Password">
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
                        Login
                    </>
                )}
            </button>
        </>
    );
};
