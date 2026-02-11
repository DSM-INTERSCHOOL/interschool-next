"use client";

import { type ReactNode } from "react";
import { SchoolBadge } from "@/components/SchoolBadge";
import { getOrgConfig } from "@/lib/orgConfig";

const AuthLayout = ({ children }: { children: ReactNode }) => {
    const config = getOrgConfig();

    // Determinar la imagen y el nombre según el tipo de portal
    const getPortalConfig = () => {
        const portalName = config.portalName?.toLowerCase() || '';

        if (portalName.includes('meta')) {
            return {
                image: '/images/auth/auth-hero-admin.png',
                name: 'Portal Administración'
            };
        } else if (portalName.includes('alumno')) {
            return {
                image: '/images/auth/auth-hero-student.png',
                name: 'Portal Alumno'
            };
        } else if (portalName.includes('profesor')) {
            return {
                image: '/images/auth/auth-hero-teacher.png',
                name: 'Portal Profesor'
            };
        }

        return {
            image: '/images/auth/auth-hero.png',
            name: config.portalName
        };
    };

    const portalConfig = getPortalConfig();

    return (
        <div className="grid grid-cols-12 overflow-auto sm:h-screen">
            <div className="relative hidden bg-[#FFE9D1] lg:col-span-7 lg:block xl:col-span-8 2xl:col-span-9 dark:bg-[#14181c]">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-12">
                    <h1 className="text-3xl font-bold text-base-content">{portalConfig.name}</h1>
                    <img src={portalConfig.image} className="object-contain max-w-2xl max-h-[70vh]" alt="Auth Image" />
                </div>
            </div>
            <div className="col-span-12 lg:col-span-5 xl:col-span-4 2xl:col-span-3">
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
