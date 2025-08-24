"use client";

import Link from "next/link";
import { MegaphoneIcon } from "@heroicons/react/24/outline";

export const TopbarNotificationButton = () => {
    const closeMenu = () => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    };

    return (
        <div className="dropdown dropdown-bottom sm:dropdown-end max-sm:dropdown-center">
            <div tabIndex={0} role="button" className="btn btn-circle btn-ghost btn-sm" aria-label="Notifications">
                <span className="iconify lucide--bell size-4.5" />
            </div>
            <div
                tabIndex={0}
                className="dropdown-content bg-base-100 rounded-box card card-compact mt-5 w-60 p-2 shadow sm:w-84">
                <div className="flex items-center justify-between px-2">
                    <p className="text-base font-medium">Notification</p>
                    <button
                        tabIndex={0}
                        className="btn btn-sm btn-circle btn-ghost"
                        onClick={closeMenu}
                        aria-label="Close">
                        <span className="iconify lucide--x size-4" />
                    </button>
                </div>
                <div className="flex items-center justify-center">
                    <div className="badge badge-sm badge-primary badge-soft">Today</div>
                </div>
                <div className="mt-2">
                    {/* Preview de Avisos */}
                    <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <MegaphoneIcon className="w-4 h-4 text-primary" />
                            <span className="text-xs font-medium text-base-content/70">Avisos Recientes</span>
                        </div>
                        <Link href="/apps/publications/avisos" onClick={closeMenu}>
                            <div className="rounded-box hover:bg-base-200 flex cursor-pointer gap-3 px-2 py-1.5 transition-all">
                                <div className="bg-primary/10 rounded-full p-1.5">
                                    <MegaphoneIcon className="w-4 h-4 text-primary" />
                                </div>
                                <div className="grow">
                                    <p className="text-sm leading-tight font-medium">Reunión de Padres - Marzo 2024</p>
                                    <p className="text-xs text-base-content/60 leading-tight">Importante reunión informativa sobre el progreso académico</p>
                                    <p className="text-base-content/60 text-end text-xs leading-tight">2 horas ago</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/apps/publications/avisos" onClick={closeMenu}>
                            <div className="rounded-box hover:bg-base-200 flex cursor-pointer gap-3 px-2 py-1.5 transition-all">
                                <div className="bg-warning/10 rounded-full p-1.5">
                                    <MegaphoneIcon className="w-4 h-4 text-warning" />
                                </div>
                                <div className="grow">
                                    <p className="text-sm leading-tight font-medium">Suspensión de Clases</p>
                                    <p className="text-xs text-base-content/60 leading-tight">Por mantenimiento del sistema eléctrico</p>
                                    <p className="text-base-content/60 text-end text-xs leading-tight">1 día ago</p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Preview de Eventos */}
                    <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="iconify lucide--calendar size-4 text-success" />
                            <span className="text-xs font-medium text-base-content/70">Próximos Eventos</span>
                        </div>
                        <Link href="/apps/publications/eventos" onClick={closeMenu}>
                            <div className="rounded-box hover:bg-base-200 flex cursor-pointer gap-3 px-2 py-1.5 transition-all">
                                <div className="bg-success/10 rounded-full p-1.5">
                                    <span className="iconify lucide--calendar size-4 text-success" />
                                </div>
                                <div className="grow">
                                    <p className="text-sm leading-tight font-medium">Feria de Ciencias 2024</p>
                                    <p className="text-xs text-base-content/60 leading-tight">Exposición de proyectos estudiantiles</p>
                                    <p className="text-base-content/60 text-end text-xs leading-tight">En 3 días</p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Preview de Feed */}
                    <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="iconify lucide--rss size-4 text-info" />
                            <span className="text-xs font-medium text-base-content/70">Feed Reciente</span>
                        </div>
                        <Link href="/apps/publications/feed" onClick={closeMenu}>
                            <div className="rounded-box hover:bg-base-200 flex cursor-pointer gap-3 px-2 py-1.5 transition-all">
                                <img
                                    src="/images/avatars/1.png"
                                    className="bg-base-200 mask mask-squircle size-8 p-0.5"
                                    alt=""
                                />
                                <div className="grow">
                                    <p className="text-sm leading-tight font-medium">Nuevo logro académico</p>
                                    <p className="text-xs text-base-content/60 leading-tight">El equipo de matemáticas ganó la competencia regional</p>
                                    <p className="text-base-content/60 text-end text-xs leading-tight">4 horas ago</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
                <div className="mt-2 flex items-center justify-center">
                    <div className="badge badge-sm">Previous</div>
                </div>
                <div className="mt-2">
                    <div className="rounded-box hover:bg-base-200 flex cursor-pointer gap-3 px-2 py-1.5 transition-all">
                        <img
                            src="/images/avatars/1.png"
                            className="bg-base-200 mask mask-squircle size-10 p-0.5"
                            alt=""
                        />
                        <div className="grow">
                            <p className="text-sm leading-tight">Prepare for the upcoming weekend promotion</p>
                            <p className="text-base-content/60 text-end text-xs leading-tight">2 Days ago</p>
                        </div>
                    </div>

                    <div className="rounded-box hover:bg-base-200 flex cursor-pointer gap-3 px-2 py-1.5 transition-all">
                        <img
                            src="/images/avatars/2.png"
                            className="bg-base-200 mask mask-squircle size-10 p-0.5"
                            alt=""
                        />
                        <div className="grow">
                            <p className="text-sm leading-tight">Product &apos;ABC123&apos; is running low in stock.</p>
                            <p className="text-base-content/60 text-end text-xs leading-tight">3 Days ago</p>
                        </div>
                    </div>
                    <div className="rounded-box hover:bg-base-200 flex cursor-pointer gap-3 px-2 py-1.5 transition-all">
                        <img
                            src="/images/avatars/3.png"
                            className="bg-base-200 mask mask-squircle size-10 p-0.5"
                            alt=""
                        />
                        <div className="grow">
                            <p className="text-sm leading-tight">Payment received for Order ID: #67890</p>
                            <p className="text-base-content/60 text-end text-xs leading-tight">Week ago</p>
                        </div>
                    </div>
                </div>
                <hr className="border-base-300 -mx-2 mt-2" />
                
                <div className="flex items-center justify-between pt-2">
                    <button className="btn btn-sm btn-ghost">Mark as read</button>
                    <Link href="/apps/publications" onClick={closeMenu}>
                        <button className="btn btn-sm btn-soft btn-primary">View All</button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
