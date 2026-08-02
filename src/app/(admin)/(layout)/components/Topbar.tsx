"use client";

import Link from "next/link";

import { ThemeToggleDropdown } from "@/components/ThemeToggleDropdown";
import { useAuth } from "@/hooks/useAuth";

import { TopbarNotificationButton } from "./TopbarNotificationButton";
import { TopbarAppointmentsButton } from "./TopbarAppointmentsButton";
import { TopbarFeedButton } from "./TopbarFeedButton";
import { TopbarDirectMessagesButton } from "./TopbarDirectMessagesButton";

export const Topbar = () => {
    const { name, email, personInternalId, personType, logout } = useAuth();

    return (
        <div
            role="navigation"
            aria-label="Navbar"
            className="flex items-center justify-between px-3"
            id="layout-topbar">
            <div className="inline-flex items-center">
                <label
                    className="btn btn-circle btn-ghost btn-sm"
                    aria-label="Ocultar/mostrar panel"
                    title="Ocultar/mostrar panel"
                    htmlFor="layout-sidebar-toggle-trigger">
                    <span className="iconify lucide--panel-left size-4.5" />
                </label>
            </div>
            <div className="inline-flex items-center gap-1.5">
                <TopbarFeedButton />
                <TopbarNotificationButton />
                <TopbarDirectMessagesButton />
                <TopbarAppointmentsButton />

                <span className="text-base-content/20 select-none">|</span>

                <ThemeToggleDropdown
                    triggerClass="btn btn-sm btn-circle btn-ghost"
                    dropdownClass="dropdown-center"
                    dropdownContentClass="mt-2"
                    iconClass="size-4.5"
                />
                <label htmlFor="layout-rightbar-drawer" className="btn btn-circle btn-ghost btn-sm drawer-button">
                    <span className="iconify lucide--settings-2 size-4.5" />
                </label>

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
                                    {personType && ` • ${personType}`}
                                </p>
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
