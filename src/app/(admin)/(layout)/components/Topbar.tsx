"use client";

import Link from "next/link";

import { ThemeToggleDropdown } from "@/components/ThemeToggleDropdown";
import { useAuth } from "@/hooks/useAuth";

import { TopbarNotificationButton } from "./TopbarNotificationButton";
import { TopbarSearchButton } from "./TopbarSearchButton";

export const Topbar = () => {
    const { name, email, personInternalId, status, personType, logout } = useAuth();

    return (
        <div
            role="navigation"
            aria-label="Navbar"
            className="flex items-center justify-between px-3"
            id="layout-topbar">
            <div className="inline-flex items-center gap-3">
                <label
                    className="btn btn-square btn-ghost btn-sm"
                    aria-label="Leftmenu toggle"
                    htmlFor="layout-sidebar-toggle-trigger">
                    <span className="iconify lucide--menu size-5" />
                </label>
                <TopbarSearchButton />
            </div>
            <div className="inline-flex items-center gap-1.5">
                <ThemeToggleDropdown
                    triggerClass="btn btn-sm btn-circle btn-ghost"
                    dropdownClass="dropdown-center"
                    dropdownContentClass="mt-2"
                    iconClass="size-4.5"
                />
                <label htmlFor="layout-rightbar-drawer" className="btn btn-circle btn-ghost btn-sm drawer-button">
                    <span className="iconify lucide--settings-2 size-4.5" />
                </label>
                <TopbarNotificationButton />

                <div className="dropdown dropdown-bottom dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost rounded-btn px-1.5">
                        <div className="flex items-center gap-2">
                            <div className="avatar">
                                <div className="bg-base-200 mask mask-squircle w-8">
                                    <img src="/images/avatars/1.png" alt="Avatar" />
                                </div>
                            </div>
                            <div className="-space-y-0.5 text-start">
                                <p className="text-sm">{name || 'Usuario'}</p>
                                <p className="text-base-content/60 text-xs">
                                    {personInternalId || email || 'usuario@example.com'}
                                </p>
                                {status && (
                                    <p className="text-base-content/40 text-xs">
                                        {status} • {personType}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div tabIndex={0} className="dropdown-content bg-base-100 rounded-box mt-4 w-44 shadow">
                        <ul className="menu w-full p-2">
                            <li>
                                <div>
                                    <span className="iconify lucide--user size-4" />
                                    <span>Mi Perfil</span>
                                </div>
                            </li>
                            <li>
                                <div>
                                    <span className="iconify lucide--settings size-4" />
                                    <span>Configuración</span>
                                </div>
                            </li>
                            <li>
                                <div>
                                    <span className="iconify lucide--arrow-left-right size-4" />
                                    <span>Cambiar Cuenta</span>
                                </div>
                            </li>
                            <li>
                                <div>
                                    <span className="iconify lucide--help-circle size-4" />
                                    <span>Ayuda</span>
                                </div>
                            </li>
                        </ul>
                        <hr className="border-base-300" />
                        <ul className="menu w-full p-2">
                            <li>
                                <button 
                                    className="text-error hover:bg-error/10 w-full text-left"
                                    onClick={logout}
                                >
                                    <span className="iconify lucide--log-out size-4" />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
