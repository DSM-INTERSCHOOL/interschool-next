"use client";

import axios from "axios";
import Link from "next/link";
import React, { useState } from "react";
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';



export const LoginAuth = () => {
    const [showPassword, setShowPassword] = useState(false);
    const setPermisos = useAuthStore((state) => state.setPermisos);
    const router = useRouter();


    
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e: any) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async () => {
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
            setPermisos(res.data.meta_data.permisos)
            router.push('/dashboards/ecommerce')
        } catch (error) {
            console.log("error", error);
            alert("Error al iniciar sesion");
        }
    };

    return (
        <>
            <fieldset className="fieldset">
                <legend className="fieldset-legend">Email Address</legend>
                <label className="input w-full focus:outline-0">
                    <span className="iconify lucide--mail text-base-content/80 size-5"></span>
                    <input
                        value={formData.email}
                        name="email"
                        onChange={handleChange}
                        className="grow focus:outline-0"
                        placeholder="Email Address"
                        type="email"
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
                        className="grow focus:outline-0"
                        placeholder="Password"
                        value={formData.password}
                        type={showPassword ? "text" : "password"}
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

            <button onClick={handleSubmit} className="btn btn-primary btn-wide mt-4 max-w-full gap-3 md:mt-6">
                <span className="iconify lucide--log-in size-4" />
                Login
            </button>
        </>
    );
};
